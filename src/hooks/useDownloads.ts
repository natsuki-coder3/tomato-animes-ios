/**
 * Tomato Animes - Downloads Hooks
 * Convenience hooks for download management
 */

import { useDownloadsStore } from '@store/downloadsStore';
import { useCallback } from 'react';

export const useDownloads = () => {
  const {
    downloads,
    isDownloading,
    queue,
    startDownload,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    deleteDownload,
    retryDownload,
    updateProgress,
    completeDownload,
    failDownload,
    getDownload,
    getDownloadsByAnime,
    getActiveDownloads,
    getCompletedDownloads,
    getFailedDownloads,
    clearCompleted,
    clearFailed,
    reorderQueue,
  } = useDownloadsStore();

  const start = useCallback(async (animeId: string, episode: number, quality: string) => {
    await startDownload(animeId, episode, quality);
  }, [startDownload]);

  const pause = useCallback((downloadId: string) => {
    pauseDownload(downloadId);
  }, [pauseDownload]);

  const resume = useCallback((downloadId: string) => {
    resumeDownload(downloadId);
  }, [resumeDownload]);

  const cancel = useCallback((downloadId: string) => {
    cancelDownload(downloadId);
  }, [cancelDownload]);

  const remove = useCallback((downloadId: string) => {
    deleteDownload(downloadId);
  }, [deleteDownload]);

  const retry = useCallback((downloadId: string) => {
    retryDownload(downloadId);
  }, [retryDownload]);

  const byAnime = useCallback((animeId: string) => {
    return getDownloadsByAnime(animeId);
  }, [getDownloadsByAnime]);

  const active = useCallback(() => {
    return getActiveDownloads();
  }, [getActiveDownloads]);

  const completed = useCallback(() => {
    return getCompletedDownloads();
  }, [getCompletedDownloads]);

  const failed = useCallback(() => {
    return getFailedDownloads();
  }, [getFailedDownloads]);

  const clearDone = useCallback(() => {
    clearCompleted();
  }, [clearCompleted]);

  const clearErrors = useCallback(() => {
    clearFailed();
  }, [clearFailed]);

  return {
    // State
    downloads,
    isDownloading,
    queue,

    // Actions
    startDownload: start,
    pauseDownload: pause,
    resumeDownload: resume,
    cancelDownload: cancel,
    deleteDownload: remove,
    retryDownload: retry,
    getDownload,
    getDownloadsByAnime: byAnime,
    getActiveDownloads: active,
    getCompletedDownloads: completed,
    getFailedDownloads: failed,
    clearCompleted: clearDone,
    clearFailed: clearErrors,
    reorderQueue,
  };
};

export const useDownloadStatus = (animeId: string, episode: number) => {
  const { downloads } = useDownloadsStore();

  const download = downloads.find(d => d.animeId === animeId && d.episode === episode);

  return {
    download,
    isDownloading: download?.status === 'downloading',
    isPaused: download?.status === 'paused',
    isCompleted: download?.status === 'completed',
    isFailed: download?.status === 'failed',
    isQueued: download?.status === 'queued',
    progress: download?.progress || 0,
  };
};

export const useDownloadQueue = () => {
  const { queue, downloads, reorderQueue } = useDownloadsStore();

  const queuedDownloads = queue.map(id => downloads.find(d => d.id === id)).filter(Boolean);

  return {
    queue: queuedDownloads,
    reorder: reorderQueue,
    count: queue.length,
  };
};