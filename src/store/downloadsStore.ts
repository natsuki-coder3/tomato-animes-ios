/**
 * Tomato Animes - Downloads Store
 * Zustand store for offline downloads management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage, STORAGE_KEYS } from '@services/storage';
import { api } from '@services/api';
import { analyticsService } from '@services/analytics';

export interface DownloadItem {
  id: string;
  animeId: string;
  episode: number;
  anime: {
    id: string;
    title: string;
    coverImage: string;
  };
  quality: string;
  format: string;
  status: 'queued' | 'downloading' | 'paused' | 'completed' | 'failed';
  progress: number; // 0-100
  downloadedBytes: number;
  totalBytes: number;
  speed: number; // bytes/sec
  error?: string;
  filePath?: string;
  subtitlePaths?: string[];
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

interface DownloadsState {
  downloads: DownloadItem[];
  isDownloading: boolean;
  queue: string[]; // download IDs in order

  // Actions
  startDownload: (animeId: string, episode: number, quality: string) => Promise<void>;
  pauseDownload: (downloadId: string) => void;
  resumeDownload: (downloadId: string) => void;
  cancelDownload: (downloadId: string) => void;
  deleteDownload: (downloadId: string) => void;
  retryDownload: (downloadId: string) => void;
  updateProgress: (downloadId: string, progress: number, downloadedBytes: number, speed: number) => void;
  completeDownload: (downloadId: string, filePath: string, subtitlePaths?: string[]) => void;
  failDownload: (downloadId: string, error: string) => void;
  getDownload: (downloadId: string) => DownloadItem | undefined;
  getDownloadsByAnime: (animeId: string) => DownloadItem[];
  getActiveDownloads: () => DownloadItem[];
  getCompletedDownloads: () => DownloadItem[];
  getFailedDownloads: () => DownloadItem[];
  clearCompleted: () => void;
  clearFailed: () => void;
  reorderQueue: (downloadIds: string[]) => void;
}

const useDownloadsStore = create<DownloadsState>()(
  persist(
    (set, get) => ({
      downloads: [],
      isDownloading: false,
      queue: [],

      // Start a new download
      startDownload: async (animeId: string, episode: number, quality: string) => {
        // Check if already downloading/queued
        const existing = get().downloads.find(
          d => d.animeId === animeId && d.episode === episode &&
               ['queued', 'downloading', 'paused'].includes(d.status)
        );

        if (existing) {
          // Resume if paused
          if (existing.status === 'paused') {
            get().resumeDownload(existing.id);
          }
          return;
        }

        try {
          // Get video sources
          const sources = await api.getVideoSources(animeId, episode.toString());
          const source = sources.find(s => s.quality === quality) || sources[0];

          if (!source) throw new Error('No video source found');

          // Get anime info
          const anime = await api.getAnimeDetails(animeId);

          const downloadId = `dl_${animeId}_${episode}_${Date.now()}`;

          const download: DownloadItem = {
            id: downloadId,
            animeId,
            episode,
            anime: {
              id: anime.id,
              title: anime.title,
              coverImage: anime.coverImage,
            },
            quality: source.quality,
            format: source.format,
            status: 'queued',
            progress: 0,
            downloadedBytes: 0,
            totalBytes: 0,
            speed: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          set(state => ({
            downloads: [download, ...state.downloads],
            queue: [downloadId, ...state.queue],
          }));

          // Start actual download (this would use a native module or background task)
          // For now, simulate
          get().simulateDownload(downloadId, source.url);

          await analyticsService.trackDownloadEvent('download_start', animeId, episode, quality);
        } catch (error: any) {
          console.error('[Downloads] Failed to start download:', error);
          throw error;
        }
      },

      // Simulate download for demo (replace with actual implementation)
      simulateDownload: (downloadId: string, url: string) => {
        const download = get().downloads.find(d => d.id === downloadId);
        if (!download) return;

        // Update to downloading
        set(state => ({
          downloads: state.downloads.map(d =>
            d.id === downloadId ? { ...d, status: 'downloading' as const, updatedAt: Date.now() } : d
          ),
          isDownloading: true,
        }));

        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
          const current = get().downloads.find(d => d.id === downloadId);
          if (!current || current.status !== 'downloading') {
            clearInterval(interval);
            return;
          }

          progress += Math.random() * 10;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            // Complete download
            get().completeDownload(downloadId, `${storage.getString('documents_path') || ''}/${download.animeId}_ep${download.episode}.mp4`);
          } else {
            get().updateProgress(downloadId, progress, Math.floor(progress / 100 * 50000000), 2000000);
          }
        }, 1000);
      },

      // Pause download
      pauseDownload: (downloadId: string) => {
        set(state => ({
          downloads: state.downloads.map(d =>
            d.id === downloadId && d.status === 'downloading'
              ? { ...d, status: 'paused' as const, updatedAt: Date.now() }
              : d
          ),
        }));
      },

      // Resume download
      resumeDownload: (downloadId: string) => {
        const download = get().downloads.find(d => d.id === downloadId);
        if (!download || download.status !== 'paused') return;

        set(state => ({
          downloads: state.downloads.map(d =>
            d.id === downloadId ? { ...d, status: 'downloading' as const, updatedAt: Date.now() } : d
          ),
        }));

        // Resume actual download
        get().simulateDownload(downloadId, '');
      },

      // Cancel download
      cancelDownload: (downloadId: string) => {
        set(state => ({
          downloads: state.downloads.map(d =>
            d.id === downloadId && ['queued', 'downloading', 'paused'].includes(d.status)
              ? { ...d, status: 'failed' as const, error: 'Cancelled by user', updatedAt: Date.now() }
              : d
          ),
          queue: state.queue.filter(id => id !== downloadId),
        }));
      },

      // Delete download (remove file and record)
      deleteDownload: (downloadId: string) => {
        const download = get().downloads.find(d => d.id === downloadId);
        if (download?.filePath) {
          // Delete actual file
          // FileSystem.deleteAsync(download.filePath);
        }

        set(state => ({
          downloads: state.downloads.filter(d => d.id !== downloadId),
          queue: state.queue.filter(id => id !== downloadId),
        }));
      },

      // Retry failed download
      retryDownload: (downloadId: string) => {
        const download = get().downloads.find(d => d.id === downloadId);
        if (!download || download.status !== 'failed') return;

        set(state => ({
          downloads: state.downloads.map(d =>
            d.id === downloadId ? { ...d, status: 'queued' as const, error: undefined, progress: 0, downloadedBytes: 0, speed: 0, updatedAt: Date.now() } : d
          ),
          queue: [downloadId, ...state.queue.filter(id => id !== downloadId)],
        }));

        get().simulateDownload(downloadId, '');
      },

      // Update progress
      updateProgress: (downloadId: string, progress: number, downloadedBytes: number, speed: number) => {
        set(state => ({
          downloads: state.downloads.map(d =>
            d.id === downloadId
              ? { ...d, progress, downloadedBytes, speed, updatedAt: Date.now() }
              : d
          ),
        }));
      },

      // Complete download
      completeDownload: (downloadId: string, filePath: string, subtitlePaths?: string[]) => {
        set(state => ({
          downloads: state.downloads.map(d =>
            d.id === downloadId
              ? { ...d, status: 'completed' as const, progress: 100, filePath, subtitlePaths, completedAt: Date.now(), updatedAt: Date.now() }
              : d
          ),
          queue: state.queue.filter(id => id !== downloadId),
          isDownloading: state.downloads.some(d => d.status === 'downloading' && d.id !== downloadId),
        }));

        const download = get().downloads.find(d => d.id === downloadId);
        if (download) {
          analyticsService.trackDownloadEvent('download_complete', download.animeId, download.episode, download.quality);
        }
      },

      // Fail download
      failDownload: (downloadId: string, error: string) => {
        set(state => ({
          downloads: state.downloads.map(d =>
            d.id === downloadId
              ? { ...d, status: 'failed' as const, error, updatedAt: Date.now() }
              : d
          ),
          queue: state.queue.filter(id => id !== downloadId),
          isDownloading: state.downloads.some(d => d.status === 'downloading' && d.id !== downloadId),
        }));

        const download = get().downloads.find(d => d.id === downloadId);
        if (download) {
          analyticsService.trackDownloadEvent('download_failed', download.animeId, download.episode, download.quality, { error });
        }
      },

      // Get single download
      getDownload: (downloadId: string) => {
        return get().downloads.find(d => d.id === downloadId);
      },

      // Get downloads for anime
      getDownloadsByAnime: (animeId: string) => {
        return get().downloads.filter(d => d.animeId === animeId);
      },

      // Get active downloads
      getActiveDownloads: () => {
        return get().downloads.filter(d => ['queued', 'downloading', 'paused'].includes(d.status));
      },

      // Get completed downloads
      getCompletedDownloads: () => {
        return get().downloads.filter(d => d.status === 'completed');
      },

      // Get failed downloads
      getFailedDownloads: () => {
        return get().downloads.filter(d => d.status === 'failed');
      },

      // Clear completed downloads
      clearCompleted: () => {
        set(state => ({
          downloads: state.downloads.filter(d => d.status !== 'completed'),
        }));
      },

      // Clear failed downloads
      clearFailed: () => {
        set(state => ({
          downloads: state.downloads.filter(d => d.status !== 'failed'),
        }));
      },

      // Reorder queue
      reorderQueue: (downloadIds: string[]) => {
        set({ queue: downloadIds });
      },
    }),
    {
      name: 'downloads-storage',
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
        downloads: state.downloads,
        queue: state.queue,
      }),
    }
  )
);

export const useDownloadsStore = useDownloadsStore;
export default useDownloadsStore;