/**
 * Tomato Animes - Player Screen
 * Full-screen video player with Liquid Glass controls
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, SafeAreaView, Platform, BackHandler } from 'react-native';
import { Video, AVPlaybackStatus } from 'expo-av';
import { useQuery } from '@tanstack/react-query';
import { GlassPlayerControls, GlassCard, GlassCardSection, GlassDivider, GlassButton, GlassProgress } from '@components/glass';
import { useColors, useTheme } from '@theme/themeProvider';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { api } from '@services/api';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { usePlayerStore } from '@store/playerStore';
import { SubtitleTrack, AudioTrack } from '@components/glass/GlassPlayerControls';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PlayerParams {
  animeId: string;
  episode?: string;
}

export default function PlayerScreen() {
  const colors = useColors();
  const { isReducedMotion } = useTheme();
  const navigation = useNavigation();
  const params = useLocalSearchParams<PlayerParams>();
  const { animeId, episode } = params;

  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useRef<NodeJS.Timeout | null>(null);
  const [quality, setQuality] = useState('Auto');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [selectedSubtitle, setSelectedSubtitle] = useState<SubtitleTrack | null>(null);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<AudioTrack | null>(null);
  const [buffered, setBuffered] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const {
    addToHistory,
    updateProgress,
    setCurrentEpisode,
    currentEpisode,
  } = usePlayerStore();

  const { data: animeData, isLoading } = useQuery({
    queryKey: ['anime', animeId],
    queryFn: () => api.getAnimeDetails(animeId),
  });

  const { data: episodes, isLoading: episodesLoading } = useQuery({
    queryKey: ['episodes', animeId],
    queryFn: () => api.getEpisodes(animeId),
  });

  const { data: sources, isLoading: sourcesLoading } = useQuery({
    queryKey: ['sources', animeId, episode || currentEpisode],
    queryFn: () => api.getVideoSources(animeId, episode || currentEpisode),
    enabled: !!(animeId && (episode || currentEpisode)),
  });

  // Auto-hide controls
  const hideControls = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      if (status?.isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [status?.isPlaying]);

  const showControlsHandler = useCallback(() => {
    setShowControls(true);
    hideControls();
  }, [hideControls]);

  // Load video when sources are available
  useEffect(() => {
    if (sources && sources.length > 0 && videoRef.current) {
      const source = sources.find(s => s.quality === quality) || sources[0];
      videoRef.current.loadAsync({ uri: source.url }, { shouldPlay: true, rate: playbackRate });
      setError(null);
    }
  }, [sources, quality, playbackRate]);

  // Handle playback status updates
  const onPlaybackStatusUpdate = useCallback((newStatus: AVPlaybackStatus) => {
    setStatus(newStatus);
    setBuffered(newStatus.playableDuration ? (newStatus.positionMillis / newStatus.durationMillis) : 0);

    if (newStatus.isLoaded && newStatus.didJustFinish) {
      // Auto-play next episode
      const nextEp = episodes?.find((ep: any) => ep.number === (parseInt(episode || currentEpisode || '1') + 1));
      if (nextEp) {
        navigation.navigate('player', { animeId, episode: nextEp.number.toString() });
      }
    }

    if (newStatus.isLoaded && newStatus.isPlaying) {
      updateProgress(animeId, episode || currentEpisode, newStatus.positionMillis, newStatus.durationMillis);
    }
  }, [animeId, episode, currentEpisode, episodes, updateProgress]);

  // Hardware back button handling
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isFullscreen) {
        setIsFullscreen(false);
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [isFullscreen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.unloadAsync();
      }
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, []);

  // Prepare subtitles and audio tracks
  const subtitleTracks: SubtitleTrack[] = (sources?.[0]?.subtitles || []).map((sub: any, index: number) => ({
    id: index.toString(),
    label: sub.label || `Legenda ${index + 1}`,
    language: sub.language || 'pt-BR',
    url: sub.url,
    isDefault: sub.isDefault || index === 0,
  }));

  const audioTracks: AudioTrack[] = (sources?.[0]?.audioTracks || []).map((audio: any, index: number) => ({
    id: index.toString(),
    label: audio.label || `Áudio ${index + 1}`,
    language: audio.language || 'ja-JP',
    url: audio.url,
    isDefault: audio.isDefault || index === 0,
  }));

  if (isLoading || episodesLoading || sourcesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.videoContainer}>
          <GlassProgress variant="indeterminate" color={colors.primary} style={styles.loadingIndicator} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !sources || sources.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="videocam-off-outline" size={64} color={colors.error} style={{ marginBottom: 16 }} />
          <GlassCard variant="surface" style={{ padding: 24, alignItems: 'center', width: '90%' }}>
            <GlassButton variant="primary" onPress={() => navigation.goBack()}>
              Voltar
            </GlassButton>
          </GlassCard>
        </View>
      </SafeAreaView>
    );
  }

  const currentEp = episodes?.find((ep: any) => ep.number === parseInt(episode || currentEpisode || '1'));
  const nextEp = episodes?.find((ep: any) => ep.number === parseInt(episode || currentEpisode || '1') + 1);
  const prevEp = episodes?.find((ep: any) => ep.number === parseInt(episode || currentEpisode || '1') - 1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          style={StyleSheet.absoluteFill}
          useNativeControls={false}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          onError={(err) => setError(err.message)}
          resizeMode="contain"
          allowsExternalPlayback={true}
          useTextureView={Platform.OS === 'android'}
        />

        <GlassPlayerControls
          state={{
            isPlaying: status?.isPlaying || false,
            currentTime: status?.positionMillis || 0,
            duration: status?.durationMillis || 0,
            buffered,
            volume: status?.volume || 1,
            muted: status?.isMuted || false,
            fullscreen: isFullscreen,
            playbackRate,
            quality,
            qualities: ['Auto', '1080p', '720p', '480p', '360p'],
            subtitles: subtitleTracks,
            selectedSubtitle: subtitleTracks.findIndex(s => s.id === selectedSubtitle?.id),
            audioTracks,
            selectedAudioTrack: audioTracks.findIndex(a => a.id === selectedAudioTrack?.id),
          }}
          onPlayPause={() => videoRef.current?.setStatusAsync({ shouldPlay: !status?.isPlaying })}
          onSeek={(time) => videoRef.current?.setStatusAsync({ positionMillis: time })}
          onSeekComplete={(time) => videoRef.current?.setStatusAsync({ positionMillis: time })}
          onVolumeChange={(volume) => videoRef.current?.setStatusAsync({ volume })}
          onMuteToggle={() => videoRef.current?.setStatusAsync({ isMuted: !status?.isMuted })}
          onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
          onPlaybackRateChange={(rate) => {
            setPlaybackRate(rate);
            videoRef.current?.setStatusAsync({ rate });
          }}
          onQualityChange={(q) => setQuality(q)}
          onSubtitleChange={(track) => setSelectedSubtitle(track)}
          onAudioTrackChange={(track) => setSelectedAudioTrack(track)}
          onNextEpisode={nextEp ? () => navigation.navigate('player', { animeId, episode: nextEp.number.toString() }) : undefined}
          onPreviousEpisode={prevEp ? () => navigation.navigate('player', { animeId, episode: prevEp.number.toString() }) : undefined}
          onSkipForward={() => videoRef.current?.setStatusAsync({ positionMillis: (status?.positionMillis || 0) + 10000 })}
          onSkipBackward={() => videoRef.current?.setStatusAsync({ positionMillis: Math.max(0, (status?.positionMillis || 0) - 10000) })}
          onPictureInPicture={() => videoRef.current?.setStatusAsync({ pictureInPicture: true })}
          onAirPlay={() => videoRef.current?.setStatusAsync({ allowsExternalPlayback: true })}
          onDownload={() => {/* Handle download */}}
          onShare={() => {/* Handle share */}}
          autoHideDelay={3000}
          style={styles.controls}
        />
      </View>

      {/* Episode Info Overlay */}
      {showControls && (
        <View style={styles.infoOverlay}>
          <View style={styles.infoContent}>
            <View style={styles.infoLeft}>
              <GlassCard variant="overlay" style={styles.infoCard}>
                <View style={styles.infoText}>
                  <Text style={styles.animeTitle}>{animeData?.title || 'Carregando...'}</Text>
                  <Text style={styles.episodeTitle}>
                    {currentEp ? `EP ${currentEp.number} - ${currentEp.title}` : `Episódio ${episode || currentEpisode}`}
                  </Text>
                </View>
              </GlassCard>
            </View>
            <View style={styles.infoRight}>
              <GlassButton variant="ghost" size="sm" onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
              </GlassButton>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -2,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  infoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLeft: {
    flex: 1,
  },
  infoRight: {
    marginLeft: 12,
  },
  infoCard: {
    padding: 12,
  },
  infoText: {
    gap: 4,
  },
  animeTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  episodeTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
});

// Add Text import
import { Text } from 'react-native';