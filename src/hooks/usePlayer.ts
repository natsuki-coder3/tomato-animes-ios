/**
 * Tomato Animes - Player Hooks
 * Convenience hooks for video player
 */

import { usePlayerStore } from '@store/playerStore';
import { useCallback } from 'react';

export const usePlayer = () => {
  const {
    currentAnimeId,
    currentEpisode,
    currentEpisodeTitle,
    currentAnimeTitle,
    currentCoverImage,
    isPlaying,
    currentTime,
    duration,
    buffered,
    volume,
    muted,
    fullscreen,
    playbackRate,
    quality,
    qualities,
    subtitles,
    selectedSubtitle,
    audioTracks,
    selectedAudioTrack,
    watchHistory,
    continueWatching,
    setCurrentEpisode,
    setPlaybackState,
    updateProgress,
    addToHistory,
    getContinueWatching,
    clearHistory,
    removeFromHistory,
  } = usePlayerStore();

  const setEpisode = useCallback((animeId: string, episode: number, title?: string, animeTitle?: string, coverImage?: string) => {
    setCurrentEpisode(animeId, episode, title, animeTitle, coverImage);
  }, [setCurrentEpisode]);

  const updateState = useCallback((state: Partial<Parameters<typeof setPlaybackState>[0]>) => {
    setPlaybackState(state);
  }, [setPlaybackState]);

  const updatePosition = useCallback((animeId: string, episode: number, position: number, duration: number) => {
    updateProgress(animeId, episode, position, duration);
  }, [updateProgress]);

  const completeEpisode = useCallback((animeId: string, episode: number, position: number, duration: number) => {
    addToHistory(animeId, episode, position, duration);
  }, [addToHistory]);

  const getContinueList = useCallback(() => {
    return getContinueWatching();
  }, [getContinueWatching]);

  const clear = useCallback(() => {
    clearHistory();
  }, [clearHistory]);

  const remove = useCallback((animeId: string, episode: number) => {
    removeFromHistory(animeId, episode);
  }, [removeFromHistory]);

  return {
    // Current episode
    currentAnimeId,
    currentEpisode,
    currentEpisodeTitle,
    currentAnimeTitle,
    currentCoverImage,

    // Playback state
    isPlaying,
    currentTime,
    duration,
    buffered,
    volume,
    muted,
    fullscreen,
    playbackRate,
    quality,
    qualities,

    // Subtitles & Audio
    subtitles,
    selectedSubtitle,
    audioTracks,
    selectedAudioTrack,

    // History
    watchHistory,
    continueWatching,

    // Actions
    setEpisode,
    updateState,
    updatePosition,
    completeEpisode,
    getContinueList,
    clearHistory: clear,
    removeFromHistory: remove,
  };
};

export const useContinueWatching = () => {
  const { continueWatching, getContinueWatching } = usePlayerStore();
  const list = getContinueWatching();
  return { continueWatching: list, raw: continueWatching };
};

export const useWatchHistory = () => {
  const { watchHistory } = usePlayerStore();
  return { watchHistory };
};