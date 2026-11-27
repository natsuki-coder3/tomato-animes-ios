/**
 * Tomato Animes - API Service
 * Centralized API communication with TomatoSignModule integration
 */

import { NativeModules, Platform } from 'react-native';
import { TomatoSignModule } from '@native/TomatoSignModule';
import { TobEncryptModule } from '@native/TobEncryptModule';

const API_BASE_URL = __DEV__
  ? 'https://api-dev.tomatoanimes.com/v1'
  : 'https://api.tomatoanimes.com/v1';

const TIMEOUT = 15000;

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  requiresAuth?: boolean;
  skipSigning?: boolean;
}

class ApiService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': `TomatoAnimes/1.6.1 (${Platform.OS}; ${Platform.Version})`,
      'X-App-Version': '1.6.1',
      'X-Build-Number': '105',
    };
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  private async getHeaders(requiresAuth: boolean = false, skipSigning: boolean = false): Promise<Record<string, string>> {
    const headers = { ...this.defaultHeaders };

    if (requiresAuth && this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Add request signing for critical endpoints
    if (!skipSigning && requiresAuth) {
      try {
        const signature = await TomatoSignModule.signRequest({
          method: 'GET', // Will be overridden
          url: '',
          timestamp: Date.now(),
          nonce: Math.random().toString(36).substring(2, 15),
        });
        headers['X-Signature'] = signature.signature;
        headers['X-Timestamp'] = signature.timestamp.toString();
        headers['X-Nonce'] = signature.nonce;
      } catch (error) {
        console.warn('Failed to sign request:', error);
      }
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, requiresAuth = false, skipSigning = false, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);
    const method = fetchOptions.method || 'GET';

    const headers = await this.getHeaders(requiresAuth, skipSigning);

    // Update signature with actual method and URL
    if (requiresAuth && !skipSigning) {
      try {
        const signature = await TomatoSignModule.signRequest({
          method,
          url,
          timestamp: Date.now(),
          nonce: Math.random().toString(36).substring(2, 15),
        });
        headers['X-Signature'] = signature.signature;
        headers['X-Timestamp'] = signature.timestamp.toString();
        headers['X-Nonce'] = signature.nonce;
      } catch (error) {
        console.warn('Failed to sign request:', error);
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...headers,
          ...fetchOptions.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          errorData.message || `HTTP ${response.status}`,
          errorData
        );
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) throw error;
      if (error.name === 'AbortError') {
        throw new ApiError(408, 'Request timeout');
      }
      throw new ApiError(0, 'Network error', { originalError: error });
    }
  }

  // Auth
  async login(email: string, password: string, rememberMe: boolean) {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
      skipSigning: true,
    });
  }

  async register(name: string, email: string, password: string) {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
      skipSigning: true,
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      skipSigning: true,
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
      requiresAuth: true,
    });
  }

  // Anime
  async getFeaturedAnimes() {
    return this.request<Anime[]>('/anime/featured');
  }

  async getPopularAnimes(page = 1, limit = 20) {
    return this.request<PaginatedResponse<Anime>>('/anime/popular', {
      params: { page: page.toString(), limit: limit.toString() },
    });
  }

  async getNewReleases(page = 1, limit = 20) {
    return this.request<PaginatedResponse<Anime>>('/anime/new-releases', {
      params: { page: page.toString(), limit: limit.toString() },
    });
  }

  async getAnimeDetails(id: string) {
    return this.request<AnimeDetails>(`/anime/${id}`);
  }

  async getEpisodes(animeId: string) {
    return this.request<Episode[]>(`/anime/${animeId}/episodes`);
  }

  async getVideoSources(animeId: string, episode: string) {
    return this.request<VideoSource[]>(`/anime/${animeId}/episodes/${episode}/sources`, {
      requiresAuth: true,
    });
  }

  async searchAnimes(params: SearchParams) {
    return this.request<PaginatedResponse<Anime>>('/anime/search', {
      params: {
        q: params.query,
        genres: params.genres?.join(','),
        type: params.type,
        status: params.status,
        sort: params.sort,
        page: params.page.toString(),
        limit: params.limit.toString(),
      },
    });
  }

  async getContinueWatching() {
    return this.request<ContinueWatchingItem[]>('/user/continue-watching', {
      requiresAuth: true,
    });
  }

  // User
  async getUserProfile() {
    return this.request<UserProfile>('/user/profile', {
      requiresAuth: true,
    });
  }

  async updateProfile(data: Partial<UserProfile>) {
    return this.request<UserProfile>('/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  }

  async getUserStats(userId: string) {
    return this.request<UserStats>(`/user/${userId}/stats`, {
      requiresAuth: true,
    });
  }

  async getWatchHistory(userId: string, params: { limit: number }) {
    return this.request<WatchHistoryItem[]>(`/user/${userId}/history`, {
      params: { limit: params.limit.toString() },
      requiresAuth: true,
    });
  }

  async getFavorites(userId: string) {
    return this.request<Anime[]>(`/user/${userId}/favorites`, {
      requiresAuth: true,
    });
  }

  async addToFavorites(animeId: string) {
    return this.request(`/user/favorites/${animeId}`, {
      method: 'POST',
      requiresAuth: true,
    });
  }

  async removeFromFavorites(animeId: string) {
    return this.request(`/user/favorites/${animeId}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  }

  // Downloads
  async getDownloadSettings() {
    return this.request<DownloadSettings>('/user/downloads/settings', {
      requiresAuth: true,
    });
  }

  async updateDownloadSettings(settings: Partial<DownloadSettings>) {
    return this.request<DownloadSettings>('/user/downloads/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
      requiresAuth: true,
    });
  }

  // Settings
  async getSettings() {
    return this.request<UserSettings>('/user/settings', {
      requiresAuth: true,
    });
  }

  async updateSettings(settings: Partial<UserSettings>) {
    return this.request<UserSettings>('/user/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
      requiresAuth: true,
    });
  }

  // Encryption helpers
  async encryptData(data: string): Promise<string> {
    return TobEncryptModule.encrypt(data);
  }

  async decryptData(encryptedData: string): Promise<string> {
    return TobEncryptModule.decrypt(encryptedData);
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  level: number;
  xp: number;
  showEmail: boolean;
  showWatchHistory: boolean;
  showFavorites: boolean;
  createdAt: string;
}

export interface UserStats {
  watchedEpisodes: number;
  favorites: number;
  watchTime: number; // minutes
  downloads: number;
}

export interface Anime {
  id: string;
  title: string;
  titleJapanese?: string;
  coverImage: string;
  bannerImage?: string;
  description: string;
  type: 'TV' | 'Movie' | 'OVA' | 'ONA' | 'Special';
  status: 'Airing' | 'Finished' | 'Upcoming';
  genres: string[];
  studios: string[];
  rating: number;
  episodes: number;
  aired: string;
  duration: number; // minutes per episode
  season?: string;
  year?: number;
}

export interface AnimeDetails extends Anime {
  synonyms: string[];
  source: string;
  score: number;
  scoredBy: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  externalLinks: ExternalLink[];
  streamingLinks: StreamingLink[];
  characters: Character[];
  staff: Staff[];
  recommendations: Anime[];
  relations: Relation[];
}

export interface Episode {
  id: string;
  animeId: string;
  number: number;
  title: string;
  thumbnail?: string;
  duration: number;
  aired: string;
  filler: boolean;
  recap: boolean;
}

export interface VideoSource {
  quality: '1080p' | '720p' | '480p' | '360p' | 'Auto';
  url: string;
  format: 'hls' | 'dash' | 'mp4';
  subtitles: Subtitle[];
  audioTracks: AudioTrack[];
}

export interface Subtitle {
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

export interface ContinueWatchingItem {
  id: string;
  animeId: string;
  anime: Anime;
  episode: number;
  position: number;
  duration: number;
  updatedAt: string;
}

export interface WatchHistoryItem {
  id: string;
  animeId: string;
  anime: Anime;
  episode: number;
  position: number;
  duration: number;
  completed: boolean;
  watchedAt: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface SearchParams {
  query: string;
  genres?: string[];
  type?: string;
  status?: string;
  sort?: string;
  page: number;
  limit: number;
}

export interface DownloadSettings {
  wifiOnly: boolean;
  storageLimit: string; // '5GB', '10GB', 'unlimited', etc.
  quality: string;
  includeSubtitles: boolean;
  autoDeleteWatched: boolean;
  maxConcurrentDownloads: number;
  used: number;
  total: number;
}

export interface UserSettings {
  language: string;
  contentRegion: string;
  defaultQualityWifi: string;
  defaultQualityMobile: string;
  autoPlayNext: boolean;
  skipIntroOutro: boolean;
  syncHistory: boolean;
  cloudBackup: boolean;
  pushEnabled: boolean;
  notifyNewEpisodes: boolean;
  notifyFavorites: boolean;
  notifyDownloads: boolean;
  notifyComments: boolean;
  quietHours: string;
  downloadWifiOnly: boolean;
  downloadStorageLimit: string;
  downloadQuality: string;
  downloadSubtitles: boolean;
  autoDeleteWatched: boolean;
  maxConcurrentDownloads: number;
  theme: 'light' | 'dark' | 'system';
  reduceTransparency: boolean;
  reduceMotion: boolean;
  textSize: string;
  accentColor: string;
  defaultPlaybackRate: string;
  gestureControls: boolean;
  gestureVolume: boolean;
  gestureBrightness: boolean;
  autoSkipIntroOutro: boolean;
  pipEnabled: boolean;
  castEnabled: boolean;
  subtitlesDefault: boolean;
  defaultSubtitleLanguage: string;
  analyticsEnabled: boolean;
  crashReporting: boolean;
  personalizedAds: boolean;
  shareUsageData: boolean;
  biometricLock: boolean;
}

export interface ExternalLink {
  site: string;
  url: string;
}

export interface StreamingLink {
  platform: string;
  url: string;
  region: string;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  image: string;
  voiceActors: VoiceActor[];
}

export interface VoiceActor {
  id: string;
  name: string;
  language: string;
  image: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  image: string;
}

export interface Relation {
  id: string;
  type: string;
  anime: Anime;
}

export const api = new ApiService();
export default api;