/**
 * Tomato Animes - Player Service
 * Video playback management with expo-av
 */

import { Audio, Video, AVPlaybackStatus, AVPlaybackSource } from 'expo-av';
import { api } from './api';
import { storage } from './storage';
import { analyticsService } from './analytics';

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  muted: boolean;
  fullscreen: boolean;
  playbackRate: number;
  quality: string;
  qualities: string[];
  subtitles: SubtitleTrack[];
  selectedSubtitle: number;
  audioTracks: AudioTrack[];
  selectedAudioTrack: number;
}

export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  url: string;
  isDefault: boolean;
}

export interface AudioTrack {
  id: string;
  label: string;
  language: string;
  url: string;
  isDefault: boolean;
}

export interface VideoSource {
  quality: string;
  url: string;
  format: 'hls' | 'dash' | 'mp4';
  subtitles: SubtitleTrack[];
  audioTracks: AudioTrack[];
}

class PlayerService {
  private videoRef: Video | null = null;
  private audioRef: Audio.Sound | null = null;
  private currentSource: VideoSource | null = null;
  private currentAnimeId: string | null = null;
  private currentEpisode: number | null = null;
  private statusListeners: Set<(status: PlayerState) => void> = new Set();
  private lastPosition = 0;
  private lastDuration = 0;

  // Get current player state
  getState(): PlayerState {
    return {
      isPlaying: false,
      currentTime: this.lastPosition,
      duration: this.lastDuration,
      buffered: 0,
      volume: storage.getVolume(),
      muted: storage.getMuted(),
      fullscreen: false,
      playbackRate: storage.getPlaybackRate(),
      quality: storage.getPreferredQuality(),
      qualities: ['Auto', '1080p', '720p', '480p', '360p'],
      subtitles: [],
      selectedSubtitle: -1,
      audioTracks: [],
      selectedAudioTrack: -1,
    };
  }

  // Subscribe to player state changes
  subscribe(listener: (state: PlayerState) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private notifyListeners(state: PlayerState) {
    this.statusListeners.forEach(listener => listener(state));
  }

  // Set video ref
  setVideoRef(ref: Video | null) {
    this.videoRef = ref;
  }

  // Load video for anime episode
  async loadVideo(animeId: string, episode: number): Promise<VideoSource[]> {
    this.currentAnimeId = animeId;
    this.currentEpisode = episode;

    try {
      const sources = await api.getVideoSources(animeId, episode.toString());
      this.currentSource = sources[0] || null;
      return sources;
    } catch (error) {
      console.error('[Player] Failed to load video sources:', error);
      throw error;
    }
  }

  // Play video with selected quality
  async play(quality: string = 'Auto'): Promise<void> {
    if (!this.currentSource || !this.videoRef) return;

    const source = this.currentSource;
    const selectedQuality = quality === 'Auto' ? source.quality : quality;

    const playbackSource: AVPlaybackSource = {
      uri: source.url,
      type: source.format,
    };

    try {
      await this.videoRef.loadAsync(playbackSource, {
        shouldPlay: true,
        rate: storage.getPlaybackRate(),
        volume: storage.getMuted() ? 0 : storage.getVolume(),
        positionMillis: 0,
      });

      // Set subtitle and audio track if available
      if (source.subtitles.length > 0) {
        const defaultSub = source.subtitles.find(s => s.isDefault) || source.subtitles[0];
        await this.setSubtitle(defaultSub);
      }

      if (source.audioTracks.length > 0) {
        const defaultAudio = source.audioTracks.find(a => a.isDefault) || source.audioTracks[0];
        await this.setAudioTrack(defaultAudio);
      }

      await analyticsService.trackPlayerEvent('player_play', this.currentAnimeId!, this.currentEpisode!, {
        quality: selectedQuality,
      });
    } catch (error) {
      console.error('[Player] Failed to play video:', error);
      await analyticsService.trackPlayerEvent('player_error', this.currentAnimeId!, this.currentEpisode!, {
        error: String(error),
        quality: selectedQuality,
      });
      throw error;
    }
  }

  // Pause video
  async pause(): Promise<void> {
    if (!this.videoRef) return;
    await this.videoRef.setStatusAsync({ shouldPlay: false });
    await analyticsService.trackPlayerEvent('player_pause', this.currentAnimeId!, this.currentEpisode!);
  }

  // Resume video
  async resume(): Promise<void> {
    if (!this.videoRef) return;
    await this.videoRef.setStatusAsync({ shouldPlay: true });
    await analyticsService.trackPlayerEvent('player_play', this.currentAnimeId!, this.currentEpisode!);
  }

  // Seek to position
  async seek(positionMillis: number): Promise<void> {
    if (!this.videoRef) return;
    await this.videoRef.setStatusAsync({ positionMillis });
    await analyticsService.trackPlayerEvent('player_seek', this.currentAnimeId!, this.currentEpisode!, {
      position: positionMillis,
    });
  }

  // Set volume
  async setVolume(volume: number): Promise<void> {
    if (!this.videoRef) return;
    const clampedVolume = Math.max(0, Math.min(1, volume));
    await this.videoRef.setStatusAsync({ volume: clampedVolume });
    storage.setVolume(clampedVolume);
  }

  // Toggle mute
  async toggleMute(): Promise<void> {
    if (!this.videoRef) return;
    const muted = !storage.getMuted();
    await this.videoRef.setStatusAsync({
      volume: muted ? 0 : storage.getVolume(),
      isMuted: muted,
    });
    storage.setMuted(muted);
  }

  // Set playback rate
  async setPlaybackRate(rate: number): Promise<void> {
    if (!this.videoRef) return;
    await this.videoRef.setStatusAsync({ rate });
    storage.setPlaybackRate(rate);
    await analyticsService.trackPlayerEvent('player_speed_change', this.currentAnimeId!, this.currentEpisode!, {
      rate,
    });
  }

  // Set quality
  async setQuality(quality: string): Promise<void> {
    if (!this.currentSource || !this.videoRef) return;

    const source = this.currentSource;
    const currentPosition = this.lastPosition;

    const selectedQuality = quality === 'Auto' ? source.quality : quality;

    const playbackSource: AVPlaybackSource = {
      uri: source.url,
      type: source.format,
    };

    try {
      await this.videoRef.loadAsync(playbackSource, {
        shouldPlay: true,
        rate: storage.getPlaybackRate(),
        volume: storage.getMuted() ? 0 : storage.getVolume(),
        positionMillis: currentPosition,
      });

      storage.setPreferredQuality(quality);
      await analyticsService.trackPlayerEvent('player_quality_change', this.currentAnimeId!, this.currentEpisode!, {
        quality: selectedQuality,
      });
    } catch (error) {
      console.error('[Player] Failed to change quality:', error);
    }
  }

  // Set subtitle track
  async setSubtitle(subtitle: SubtitleTrack): Promise<void> {
    if (!this.videoRef) return;

    try {
      // For HLS, subtitles are usually embedded
      // For MP4, we might need to load external subtitles
      // This is a simplified implementation
      console.log('[Player] Subtitle selected:', subtitle.label);
      await analyticsService.trackPlayerEvent('player_subtitle_change', this.currentAnimeId!, this.currentEpisode!, {
        subtitle_id: subtitle.id,
        subtitle_language: subtitle.language,
      });
    } catch (error) {
      console.error('[Player] Failed to set subtitle:', error);
    }
  }

  // Set audio track
  async setAudioTrack(audioTrack: AudioTrack): Promise<void> {
    if (!this.videoRef) return;

    try {
      // Audio track selection depends on the player implementation
      console.log('[Player] Audio track selected:', audioTrack.label);
      await analyticsService.trackPlayerEvent('player_audio_change', this.currentAnimeId!, this.currentEpisode!, {
        audio_id: audioTrack.id,
        audio_language: audioTrack.language,
      });
    } catch (error) {
      console.error('[Player] Failed to set audio track:', error);
    }
  }

  // Toggle fullscreen
  async toggleFullscreen(): Promise<boolean> {
    if (!this.videoRef) return false;
    // Fullscreen is handled by the UI component
    return true;
  }

  // Picture in Picture
  async enterPip(): Promise<void> {
    if (!this.videoRef) return;
    try {
      await this.videoRef.setStatusAsync({ pictureInPicture: true });
      await analyticsService.trackPlayerEvent('player_pip', this.currentAnimeId!, this.currentEpisode!);
    } catch (error) {
      console.error('[Player] Failed to enter PiP:', error);
    }
  }

  // Skip forward/backward
  async skipForward(seconds: number = 10): Promise<void> {
    if (!this.videoRef) return;
    const newPosition = Math.min(this.lastPosition + seconds * 1000, this.lastDuration);
    await this.seek(newPosition);
    await analyticsService.trackPlayerEvent('player_skip_forward', this.currentAnimeId!, this.currentEpisode!, {
      seconds,
    });
  }

  async skipBackward(seconds: number = 10): Promise<void> {
    if (!this.videoRef) return;
    const newPosition = Math.max(this.lastPosition - seconds * 1000, 0);
    await this.seek(newPosition);
    await analyticsService.trackPlayerEvent('player_skip_backward', this.currentAnimeId!, this.currentEpisode!, {
      seconds,
    });
  }

  // Next/Previous episode
  async playNextEpisode(animeId: string, nextEpisode: number): Promise<void> {
    await this.loadVideo(animeId, nextEpisode);
    await this.play();
    await analyticsService.trackPlayerEvent('player_next_episode', animeId, nextEpisode);
  }

  async playPreviousEpisode(animeId: string, prevEpisode: number): Promise<void> {
    await this.loadVideo(animeId, prevEpisode);
    await this.play();
    await analyticsService.trackPlayerEvent('player_prev_episode', animeId, prevEpisode);
  }

  // Update status from video component
  updateStatus(status: AVPlaybackStatus) {
    if (status.isLoaded) {
      this.lastPosition = status.positionMillis;
      this.lastDuration = status.durationMillis || 0;

      const state: PlayerState = {
        isPlaying: status.isPlaying,
        currentTime: status.positionMillis,
        duration: status.durationMillis || 0,
        buffered: status.playableDurationMillis ? (status.positionMillis / status.playableDurationMillis) : 0,
        volume: status.volume,
        muted: status.isMuted || false,
        fullscreen: false, // Tracked separately
        playbackRate: status.rate,
        quality: storage.getPreferredQuality(),
        qualities: ['Auto', '1080p', '720p', '480p', '360p'],
        subtitles: [],
        selectedSubtitle: -1,
        audioTracks: [],
        selectedAudioTrack: -1,
      };

      this.notifyListeners(state);
    }
  }

  // Cleanup
  async unload(): Promise<void> {
    if (this.videoRef) {
      try {
        await this.videoRef.unloadAsync();
      } catch (error) {
        console.warn('[Player] Error unloading video:', error);
      }
      this.videoRef = null;
    }
    this.currentSource = null;
    this.currentAnimeId = null;
    this.currentEpisode = null;
  }

  // Get current anime/episode
  getCurrentAnimeId(): string | null {
    return this.currentAnimeId;
  }

  getCurrentEpisode(): number | null {
    return this.currentEpisode;
  }
}

export const playerService = new PlayerService();
export default playerService;