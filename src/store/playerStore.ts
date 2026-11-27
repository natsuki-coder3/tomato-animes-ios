/**
 * Tomato Animes - Player Store
 * Zustand store for video player state management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage, STORAGE_KEYS } from '@services/storage';

interface WatchProgress {
  animeId: string;
  episode: number;
  position: number;
  duration: number;
  updatedAt: number;
}

interface PlayerState {
  // Current episode
  currentAnimeId: string | null;
  currentEpisode: number | null;
  currentEpisodeTitle: string | null;
  currentAnimeTitle: string | null;
  currentCoverImage: string | null;

  // Playback state
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

  // Subtitles & Audio
  subtitles: Array<{ id: string; label: string; language: string; url: string; isDefault: boolean }>;
  selectedSubtitle: number;
  audioTracks: Array<{ id: string; label: string; language: string; url: string; isDefault: boolean }>;
  selectedAudioTrack: number;

  // History
  watchHistory: WatchProgress[];
  continueWatching: WatchProgress[];

  // Actions
  setCurrentEpisode: (animeId: string, episode: number, title?: string, animeTitle?: string, coverImage?: string) => void;
  setPlaybackState: (state: Partial<PlayerState>) => void;
  updateProgress: (animeId: string, episode: number, position: number, duration: number) => void;
  addToHistory: (animeId: string, episode: number, position: number, duration: number) => void;
  getContinueWatching: () => WatchProgress[];
  clearHistory: () => void;
  removeFromHistory: (animeId: string, episode: number) => void;
}

const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentAnimeId: null,
      currentEpisode: null,
      currentEpisodeTitle: null,
      currentAnimeTitle: null,
      currentCoverImage: null,

      isPlaying: false,
      currentTime: 0,
      duration: 0,
      buffered: 0,
      volume: 1,
      muted: false,
      fullscreen: false,
      playbackRate: 1,
      quality: 'Auto',
      qualities: ['Auto', '1080p', '720p', '480p', '360p'],

      subtitles: [],
      selectedSubtitle: -1,
      audioTracks: [],
      selectedAudioTrack: -1,

      watchHistory: [],
      continueWatching: [],

      // Set current episode
      setCurrentEpisode: (animeId, episode, title, animeTitle, coverImage) => {
        set({
          currentAnimeId: animeId,
          currentEpisode: episode,
          currentEpisodeTitle: title || `Episódio ${episode}`,
          currentAnimeTitle: animeTitle,
          currentCoverImage: coverImage,
          currentTime: 0,
          duration: 0,
          buffered: 0,
        });
      },

      // Update playback state
      setPlaybackState: (state) => {
        set(state);
      },

      // Update progress (called frequently during playback)
      updateProgress: (animeId, episode, position, duration) => {
        const history = get().watchHistory;
        const existingIndex = history.findIndex(
          h => h.animeId === animeId && h.episode === episode
        );

        const progress: WatchProgress = {
          animeId,
          episode,
          position,
          duration,
          updatedAt: Date.now(),
        };

        if (existingIndex >= 0) {
          const newHistory = [...history];
          newHistory[existingIndex] = progress;
          set({ watchHistory: newHistory });
        } else {
          set({ watchHistory: [progress, ...history.slice(0, 99)] }); // Keep last 100
        }

        // Update continue watching
        const cw = get().continueWatching;
        const cwIndex = cw.findIndex(h => h.animeId === animeId && h.episode === episode);
        if (cwIndex >= 0) {
          const newCw = [...cw];
          newCw[cwIndex] = progress;
          set({ continueWatching: newCw });
        } else {
          set({ continueWatching: [progress, ...cw.slice(0, 19)] }); // Keep last 20
        }
      },

      // Add to history (when episode completes)
      addToHistory: (animeId, episode, position, duration) => {
        const progress: WatchProgress = {
          animeId,
          episode,
          position,
          duration,
          updatedAt: Date.now(),
        };

        const history = get().watchHistory;
        const existingIndex = history.findIndex(
          h => h.animeId === animeId && h.episode === episode
        );

        if (existingIndex >= 0) {
          const newHistory = [...history];
          newHistory[existingIndex] = progress;
          set({ watchHistory: newHistory });
        } else {
          set({ watchHistory: [progress, ...history.slice(0, 99)] });
        }
      },

      // Get continue watching list
      getContinueWatching: () => {
        return get().continueWatching
          .filter(h => h.position > 0 && h.position < h.duration * 0.95)
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, 20);
      },

      // Clear all history
      clearHistory: () => {
        set({ watchHistory: [], continueWatching: [] });
      },

      // Remove specific entry
      removeFromHistory: (animeId, episode) => {
        set({
          watchHistory: get().watchHistory.filter(h => !(h.animeId === animeId && h.episode === episode)),
          continueWatching: get().continueWatching.filter(h => !(h.animeId === animeId && h.episode === episode)),
        });
      },
    }),
    {
      name: 'player-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const value = storage.getString(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          storage.setString(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          storage.delete(name);
        },
      })),
      partialize: (state) => ({
        // Persist only essential state
        watchHistory: state.watchHistory,
        continueWatching: state.continueWatching,
        playbackRate: state.playbackRate,
        quality: state.quality,
        volume: state.volume,
        muted: state.muted,
        selectedSubtitle: state.selectedSubtitle,
        selectedAudioTrack: state.selectedAudioTrack,
      }),
    }
  )
);

export const usePlayerStore = usePlayerStore;
export default usePlayerStore;