/**
 * Tomato Animes - Settings Store
 * Zustand store for app settings management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage, STORAGE_KEYS } from '@services/storage';

interface SettingsState {
  // General
  language: string;
  contentRegion: string;
  defaultQualityWifi: string;
  defaultQualityMobile: string;
  autoPlayNext: boolean;
  skipIntroOutro: boolean;

  // Notifications
  pushEnabled: boolean;
  notifyNewEpisodes: boolean;
  notifyFavorites: boolean;
  notifyDownloads: boolean;
  notifyComments: boolean;
  quietHours: string;

  // Downloads
  downloadWifiOnly: boolean;
  downloadStorageLimit: string;
  downloadQuality: string;
  downloadSubtitles: boolean;
  autoDeleteWatched: boolean;
  maxConcurrentDownloads: number;

  // Appearance
  theme: 'light' | 'dark' | 'system';
  reduceTransparency: boolean;
  reduceMotion: boolean;
  textSize: string;
  accentColor: string;

  // Player
  defaultPlaybackRate: string;
  gestureControls: boolean;
  gestureVolume: boolean;
  gestureBrightness: boolean;
  autoSkipIntroOutro: boolean;
  pipEnabled: boolean;
  castEnabled: boolean;
  subtitlesDefault: boolean;
  defaultSubtitleLanguage: string;

  // Privacy
  analyticsEnabled: boolean;
  crashReporting: boolean;
  personalizedAds: boolean;
  shareUsageData: boolean;
  biometricLock: boolean;

  // Actions
  initialize: () => Promise<void>;
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  updateSettings: (settings: Partial<SettingsState>) => void;
  resetSettings: () => void;
}

const defaultSettings: Omit<SettingsState, 'initialize' | 'updateSetting' | 'updateSettings' | 'resetSettings'> = {
  // General
  language: 'pt-BR',
  contentRegion: 'BR',
  defaultQualityWifi: '1080p',
  defaultQualityMobile: '720p',
  autoPlayNext: true,
  skipIntroOutro: false,

  // Notifications
  pushEnabled: true,
  notifyNewEpisodes: true,
  notifyFavorites: true,
  notifyDownloads: true,
  notifyComments: false,
  quietHours: '22:00 - 08:00',

  // Downloads
  downloadWifiOnly: true,
  downloadStorageLimit: '10GB',
  downloadQuality: '1080p',
  downloadSubtitles: true,
  autoDeleteWatched: false,
  maxConcurrentDownloads: 3,

  // Appearance
  theme: 'system',
  reduceTransparency: false,
  reduceMotion: false,
  textSize: 'medium',
  accentColor: 'blue',

  // Player
  defaultPlaybackRate: '1.0',
  gestureControls: true,
  gestureVolume: true,
  gestureBrightness: true,
  autoSkipIntroOutro: false,
  pipEnabled: true,
  castEnabled: true,
  subtitlesDefault: true,
  defaultSubtitleLanguage: 'pt-BR',

  // Privacy
  analyticsEnabled: true,
  crashReporting: true,
  personalizedAds: true,
  shareUsageData: false,
  biometricLock: false,
};

const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      initialize: async () => {
        // Settings are loaded automatically by persist middleware
        // Apply theme on init
        const { theme } = get();
        // Theme is applied via ThemeProvider
      },

      updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
        set({ [key]: value });

        // Persist to MMKV
        const storageKey = STORAGE_KEYS[key as keyof typeof STORAGE_KEYS];
        if (storageKey) {
          if (typeof value === 'boolean') {
            storage.setBoolean(storageKey, value);
          } else if (typeof value === 'number') {
            storage.setNumber(storageKey, value);
          } else {
            storage.setString(storageKey, String(value));
          }
        }

        // Handle special settings that need immediate effect
        switch (key) {
          case 'theme':
            // Theme change handled by ThemeProvider
            break;
          case 'reduceTransparency':
          case 'reduceMotion':
          case 'textSize':
          case 'accentColor':
            // These trigger re-renders via ThemeProvider
            break;
          case 'analyticsEnabled':
            // Update analytics collection
            // analytics().setAnalyticsCollectionEnabled(value);
            break;
          case 'crashReporting':
            // crashlytics().setCrashlyticsCollectionEnabled(value);
            break;
        }
      },

      updateSettings: (settings: Partial<SettingsState>) => {
        Object.entries(settings).forEach(([key, value]) => {
          get().updateSetting(key as keyof SettingsState, value);
        });
      },

      resetSettings: () => {
        set(defaultSettings);
        // Clear all settings from storage
        Object.values(STORAGE_KEYS).forEach(key => {
          storage.deleteSetting(key);
        });
      },
    }),
    {
      name: 'settings-storage',
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
      partialize: (state) => {
        // Don't persist actions
        const { initialize, updateSetting, updateSettings, resetSettings, ...settings } = state;
        return settings;
      },
    }
  )
);

export const useSettingsStore = useSettingsStore;
export default useSettingsStore;