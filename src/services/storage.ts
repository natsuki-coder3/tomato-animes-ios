/**
 * Tomato Animes - Storage Service
 * MMKV-based fast key-value storage with fallback to AsyncStorage
 */

import { MMKV } from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DataStoreCounterModule } from '@native/DataStoreCounterModule';

// Initialize MMKV instances
export const appStorage = new MMKV({
  id: 'tomato-animes-app',
  encryptionKey: 'tomato-animes-secure-key-2024',
});

export const userStorage = new MMKV({
  id: 'tomato-animes-user',
  encryptionKey: 'tomato-animes-user-key-2024',
});

export const settingsStorage = new MMKV({
  id: 'tomato-animes-settings',
});

export const cacheStorage = new MMKV({
  id: 'tomato-animes-cache',
});

// Storage keys
export const STORAGE_KEYS = {
  // Auth
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PROFILE: 'user_profile',
  BIOMETRIC_ENABLED: 'biometric_enabled',

  // Settings
  THEME: 'theme',
  LANGUAGE: 'language',
  CONTENT_REGION: 'content_region',
  DEFAULT_QUALITY_WIFI: 'default_quality_wifi',
  DEFAULT_QUALITY_MOBILE: 'default_quality_mobile',
  AUTO_PLAY_NEXT: 'auto_play_next',
  SKIP_INTRO_OUTRO: 'skip_intro_outro',
  PUSH_ENABLED: 'push_enabled',
  NOTIFY_NEW_EPISODES: 'notify_new_episodes',
  NOTIFY_FAVORITES: 'notify_favorites',
  NOTIFY_DOWNLOADS: 'notify_downloads',
  NOTIFY_COMMENTS: 'notify_comments',
  QUIET_HOURS: 'quiet_hours',
  DOWNLOAD_WIFI_ONLY: 'download_wifi_only',
  DOWNLOAD_STORAGE_LIMIT: 'download_storage_limit',
  DOWNLOAD_QUALITY: 'download_quality',
  DOWNLOAD_SUBTITLES: 'download_subtitles',
  AUTO_DELETE_WATCHED: 'auto_delete_watched',
  MAX_CONCURRENT_DOWNLOADS: 'max_concurrent_downloads',
  REDUCE_TRANSPARENCY: 'reduce_transparency',
  REDUCE_MOTION: 'reduce_motion',
  TEXT_SIZE: 'text_size',
  ACCENT_COLOR: 'accent_color',
  DEFAULT_PLAYBACK_RATE: 'default_playback_rate',
  GESTURE_CONTROLS: 'gesture_controls',
  GESTURE_VOLUME: 'gesture_volume',
  GESTURE_BRIGHTNESS: 'gesture_brightness',
  AUTO_SKIP_INTRO_OUTRO: 'auto_skip_intro_outro',
  PIP_ENABLED: 'pip_enabled',
  CAST_ENABLED: 'cast_enabled',
  SUBTITLES_DEFAULT: 'subtitles_default',
  DEFAULT_SUBTITLE_LANGUAGE: 'default_subtitle_language',
  ANALYTICS_ENABLED: 'analytics_enabled',
  CRASH_REPORTING: 'crash_reporting',
  PERSONALIZED_ADS: 'personalized_ads',
  SHARE_USAGE_DATA: 'share_usage_data',
  BIOMETRIC_LOCK: 'biometric_lock',

  // Player
  PLAYBACK_RATE: 'playback_rate',
  PREFERRED_QUALITY: 'preferred_quality',
  PREFERRED_SUBTITLE_LANG: 'preferred_subtitle_lang',
  PREFERRED_AUDIO_LANG: 'preferred_audio_lang',
  VOLUME: 'volume',
  MUTED: 'muted',

  // Downloads
  DOWNLOAD_QUEUE: 'download_queue',
  DOWNLOAD_HISTORY: 'download_history',

  // Cache
  ANIME_CACHE_PREFIX: 'anime_',
  EPISODE_CACHE_PREFIX: 'episode_',
  SEARCH_CACHE_PREFIX: 'search_',
  CACHE_TIMESTAMP: 'cache_timestamp',

  // Analytics
  APP_OPEN_COUNT: 'app_open_count',
  LAST_APP_VERSION: 'last_app_version',
  ONBOARDING_COMPLETED: 'onboarding_completed',
} as const;

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// Generic storage interface
interface StorageInterface {
  getString(key: string): string | undefined;
  setString(key: string, value: string): boolean;
  getNumber(key: string): number | undefined;
  setNumber(key: string, value: number): boolean;
  getBoolean(key: string): boolean | undefined;
  setBoolean(key: string, value: boolean): boolean;
  getObject<T>(key: string): T | undefined;
  setObject<T>(key: string, value: T): boolean;
  delete(key: string): boolean;
  contains(key: string): boolean;
  clearAll(): boolean;
  getAllKeys(): string[];
}

// MMKV implementation
class MMKVStorage implements StorageInterface {
  constructor(private storage: MMKV) {}

  getString(key: string): string | undefined {
    return this.storage.getString(key);
  }

  setString(key: string, value: string): boolean {
    return this.storage.set(key, value);
  }

  getNumber(key: string): number | undefined {
    return this.storage.getNumber(key);
  }

  setNumber(key: string, value: number): boolean {
    return this.storage.set(key, value);
  }

  getBoolean(key: string): boolean | undefined {
    return this.storage.getBoolean(key);
  }

  setBoolean(key: string, value: boolean): boolean {
    return this.storage.set(key, value);
  }

  getObject<T>(key: string): T | undefined {
    const value = this.storage.getString(key);
    if (!value) return undefined;
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  }

  setObject<T>(key: string, value: T): boolean {
    return this.storage.set(key, JSON.stringify(value));
  }

  delete(key: string): boolean {
    this.storage.delete(key);
    return true;
  }

  contains(key: string): boolean {
    return this.storage.contains(key);
  }

  clearAll(): boolean {
    this.storage.clearAll();
    return true;
  }

  getAllKeys(): string[] {
    return this.storage.getAllKeys();
  }
}

// AsyncStorage fallback implementation
class AsyncStorageImpl implements StorageInterface {
  async getString(key: string): Promise<string | undefined> {
    return AsyncStorage.getItem(key) || undefined;
  }

  async setString(key: string, value: string): Promise<boolean> {
    await AsyncStorage.setItem(key, value);
    return true;
  }

  async getNumber(key: string): Promise<number | undefined> {
    const value = await AsyncStorage.getItem(key);
    return value ? parseFloat(value) : undefined;
  }

  async setNumber(key: string, value: number): Promise<boolean> {
    await AsyncStorage.setItem(key, value.toString());
    return true;
  }

  async getBoolean(key: string): Promise<boolean | undefined> {
    const value = await AsyncStorage.getItem(key);
    return value ? value === 'true' : undefined;
  }

  async setBoolean(key: string, value: boolean): Promise<boolean> {
    await AsyncStorage.setItem(key, value.toString());
    return true;
  }

  async getObject<T>(key: string): Promise<T | undefined> {
    const value = await AsyncStorage.getItem(key);
    if (!value) return undefined;
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  }

  async setObject<T>(key: string, value: T): Promise<boolean> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  }

  async delete(key: string): Promise<boolean> {
    await AsyncStorage.removeItem(key);
    return true;
  }

  async contains(key: string): Promise<boolean> {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  }

  async clearAll(): Promise<boolean> {
    await AsyncStorage.clear();
    return true;
  }

  async getAllKeys(): Promise<string[]> {
    return AsyncStorage.getAllKeys();
  }
}

// Export storage instances
export const appStore = new MMKVStorage(appStorage);
export const userStore = new MMKVStorage(userStorage);
export const settingsStore = new MMKVStorage(settingsStorage);
export const cacheStore = new MMKVStorage(cacheStorage);

// High-level storage functions
export const storage = {
  // Auth
  getAuthToken: () => appStore.getString(STORAGE_KEYS.AUTH_TOKEN),
  setAuthToken: (token: string) => appStore.setString(STORAGE_KEYS.AUTH_TOKEN, token),
  clearAuthToken: () => appStore.delete(STORAGE_KEYS.AUTH_TOKEN),

  getRefreshToken: () => appStore.getString(STORAGE_KEYS.REFRESH_TOKEN),
  setRefreshToken: (token: string) => appStore.setString(STORAGE_KEYS.REFRESH_TOKEN, token),
  clearRefreshToken: () => appStore.delete(STORAGE_KEYS.REFRESH_TOKEN),

  getUserProfile: () => appStore.getObject<any>(STORAGE_KEYS.USER_PROFILE),
  setUserProfile: (profile: any) => appStore.setObject(STORAGE_KEYS.USER_PROFILE, profile),
  clearUserProfile: () => appStore.delete(STORAGE_KEYS.USER_PROFILE),

  // Settings
  getSetting: <T>(key: StorageKey, defaultValue: T): T => {
    const value = settingsStore.getObject<T>(key);
    return value ?? defaultValue;
  },
  setSetting: <T>(key: StorageKey, value: T) => settingsStore.setObject(key, value),
  deleteSetting: (key: StorageKey) => settingsStore.delete(key),

  // Player
  getPlaybackRate: () => settingsStore.getNumber(STORAGE_KEYS.PLAYBACK_RATE) || 1,
  setPlaybackRate: (rate: number) => settingsStore.setNumber(STORAGE_KEYS.PLAYBACK_RATE, rate),

  getPreferredQuality: () => settingsStore.getString(STORAGE_KEYS.PREFERRED_QUALITY) || 'Auto',
  setPreferredQuality: (quality: string) => settingsStore.setString(STORAGE_KEYS.PREFERRED_QUALITY, quality),

  getPreferredSubtitleLang: () => settingsStore.getString(STORAGE_KEYS.PREFERRED_SUBTITLE_LANG) || 'pt-BR',
  setPreferredSubtitleLang: (lang: string) => settingsStore.setString(STORAGE_KEYS.PREFERRED_SUBTITLE_LANG, lang),

  getPreferredAudioLang: () => settingsStore.getString(STORAGE_KEYS.PREFERRED_AUDIO_LANG) || 'ja-JP',
  setPreferredAudioLang: (lang: string) => settingsStore.setString(STORAGE_KEYS.PREFERRED_AUDIO_LANG, lang),

  getVolume: () => settingsStore.getNumber(STORAGE_KEYS.VOLUME) || 1,
  setVolume: (volume: number) => settingsStore.setNumber(STORAGE_KEYS.VOLUME, volume),

  getMuted: () => settingsStore.getBoolean(STORAGE_KEYS.MUTED) || false,
  setMuted: (muted: boolean) => settingsStore.setBoolean(STORAGE_KEYS.MUTED, muted),

  // Cache
  getCache: <T>(prefix: string, key: string): T | undefined => {
    const timestamp = cacheStore.getNumber(`${prefix}${key}_ts`);
    if (!timestamp) return undefined;

    // Check if cache is older than 24 hours
    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
      cacheStore.delete(`${prefix}${key}`);
      cacheStore.delete(`${prefix}${key}_ts`);
      return undefined;
    }

    return cacheStore.getObject<T>(`${prefix}${key}`);
  },
  setCache: <T>(prefix: string, key: string, value: T) => {
    cacheStore.setObject(`${prefix}${key}`, value);
    cacheStore.setNumber(`${prefix}${key}_ts`, Date.now());
  },
  clearCache: (prefix: string) => {
    const keys = cacheStore.getAllKeys().filter(k => k.startsWith(prefix));
    keys.forEach(key => cacheStore.delete(key));
  },
  clearAllCache: () => cacheStore.clearAll(),

  // Downloads
  getDownloadQueue: () => appStore.getObject<any[]>(STORAGE_KEYS.DOWNLOAD_QUEUE) || [],
  setDownloadQueue: (queue: any[]) => appStore.setObject(STORAGE_KEYS.DOWNLOAD_QUEUE, queue),

  getDownloadHistory: () => appStore.getObject<any[]>(STORAGE_KEYS.DOWNLOAD_HISTORY) || [],
  setDownloadHistory: (history: any[]) => appStore.setObject(STORAGE_KEYS.DOWNLOAD_HISTORY, history),

  // Analytics
  incrementAppOpenCount: async () => {
    const count = await DataStoreCounterModule.increment('app_open_count');
    appStore.setNumber(STORAGE_KEYS.APP_OPEN_COUNT, count);
    return count;
  },
  getAppOpenCount: () => appStore.getNumber(STORAGE_KEYS.APP_OPEN_COUNT) || 0,

  setLastAppVersion: (version: string) => appStore.setString(STORAGE_KEYS.LAST_APP_VERSION, version),
  getLastAppVersion: () => appStore.getString(STORAGE_KEYS.LAST_APP_VERSION),

  setOnboardingCompleted: (completed: boolean) => appStore.setBoolean(STORAGE_KEYS.ONBOARDING_COMPLETED, completed),
  getOnboardingCompleted: () => appStore.getBoolean(STORAGE_KEYS.ONBOARDING_COMPLETED) || false,

  // Clear all user data (logout)
  clearUserData: () => {
    userStore.clearAll();
    appStore.delete(STORAGE_KEYS.AUTH_TOKEN);
    appStore.delete(STORAGE_KEYS.REFRESH_TOKEN);
    appStore.delete(STORAGE_KEYS.USER_PROFILE);
  },

  // Clear all data (reset app)
  clearAllData: () => {
    appStore.clearAll();
    userStore.clearAll();
    settingsStore.clearAll();
    cacheStore.clearAll();
  },
};

export default storage;