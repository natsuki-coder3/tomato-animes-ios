/**
 * Tomato Animes - Analytics Service
 * Firebase Analytics, AppCenter, and custom event tracking
 */

import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import { AppRegistry } from 'react-native';

// Event names
export const ANALYTICS_EVENTS = {
  // App lifecycle
  APP_OPEN: 'app_open',
  APP_BACKGROUND: 'app_background',
  APP_FOREGROUND: 'app_foreground',
  APP_CRASH: 'app_crash',

  // Auth
  SIGN_UP: 'sign_up',
  SIGN_IN: 'sign_in',
  SIGN_OUT: 'sign_out',
  SIGN_UP_GOOGLE: 'sign_up_google',
  SIGN_IN_GOOGLE: 'sign_in_google',
  SIGN_UP_APPLE: 'sign_up_apple',
  SIGN_IN_APPLE: 'sign_in_apple',
  PASSWORD_RESET: 'password_reset',

  // Anime
  ANIME_VIEW: 'anime_view',
  ANIME_SEARCH: 'anime_search',
  ANIME_FILTER: 'anime_filter',
  ANIME_FAVORITE_ADD: 'anime_favorite_add',
  ANIME_FAVORITE_REMOVE: 'anime_favorite_remove',
  ANIME_SHARE: 'anime_share',

  // Player
  PLAYER_OPEN: 'player_open',
  PLAYER_PLAY: 'player_play',
  PLAYER_PAUSE: 'player_pause',
  PLAYER_SEEK: 'player_seek',
  PLAYER_FULLSCREEN: 'player_fullscreen',
  PLAYER_PIP: 'player_pip',
  PLAYER_CAST: 'player_cast',
  PLAYER_QUALITY_CHANGE: 'player_quality_change',
  PLAYER_SPEED_CHANGE: 'player_speed_change',
  PLAYER_SUBTITLE_CHANGE: 'player_subtitle_change',
  PLAYER_AUDIO_CHANGE: 'player_audio_change',
  PLAYER_NEXT_EPISODE: 'player_next_episode',
  PLAYER_PREV_EPISODE: 'player_prev_episode',
  PLAYER_SKIP_FORWARD: 'player_skip_forward',
  PLAYER_SKIP_BACKWARD: 'player_skip_backward',
  PLAYER_DOWNLOAD: 'player_download',
  PLAYER_SHARE: 'player_share',
  PLAYER_ERROR: 'player_error',
  PLAYER_COMPLETE: 'player_complete',

  // Downloads
  DOWNLOAD_START: 'download_start',
  DOWNLOAD_PAUSE: 'download_pause',
  DOWNLOAD_RESUME: 'download_resume',
  DOWNLOAD_COMPLETE: 'download_complete',
  DOWNLOAD_FAILED: 'download_failed',
  DOWNLOAD_DELETE: 'download_delete',
  DOWNLOAD_RETRY: 'download_retry',

  // Settings
  SETTINGS_CHANGE: 'settings_change',
  THEME_CHANGE: 'theme_change',
  LANGUAGE_CHANGE: 'language_change',
  QUALITY_CHANGE: 'quality_change',

  // Engagement
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  SCREEN_VIEW: 'screen_view',
  FEATURE_USE: 'feature_use',

  // Monetization
  AD_IMPRESSION: 'ad_impression',
  AD_CLICK: 'ad_click',
  AD_REWARD: 'ad_reward',
  PURCHASE: 'purchase',
  SUBSCRIPTION: 'subscription',
} as const;

type EventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

interface EventParams {
  [key: string]: string | number | boolean | undefined;
}

class AnalyticsService {
  private initialized = false;
  private sessionId: string;
  private screenViews: Map<string, number> = new Map();

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Enable analytics collection
      await analytics().setAnalyticsCollectionEnabled(true);

      // Set user properties
      await analytics().setUserId('anonymous'); // Will be updated on login

      // Set default event parameters
      await analytics().setDefaultEventParameters({
        app_version: '1.6.1',
        build_number: '105',
        platform: 'ios',
        session_id: this.sessionId,
      });

      // Enable crashlytics
      await crashlytics().setCrashlyticsCollectionEnabled(true);

      this.initialized = true;
      console.log('[Analytics] Initialized successfully');
    } catch (error) {
      console.warn('[Analytics] Failed to initialize:', error);
    }
  }

  async setUserId(userId: string) {
    await analytics().setUserId(userId);
    await crashlytics().setUserId(userId);
  }

  async setUserProperty(name: string, value: string) {
    await analytics().setUserProperty(name, value);
  }

  async logEvent(eventName: EventName, params?: EventParams) {
    try {
      const eventParams = {
        ...params,
        session_id: this.sessionId,
        timestamp: Date.now(),
      };

      await analytics().logEvent(eventName, eventParams);

      // Also log to AppCenter if available
      // AppCenter.Analytics.trackEvent(eventName, eventParams);

      // Log to console in development
      if (__DEV__) {
        console.log(`[Analytics] ${eventName}`, eventParams);
      }
    } catch (error) {
      console.warn(`[Analytics] Failed to log event ${eventName}:`, error);
    }
  }

  async logScreenView(screenName: string, screenClass?: string) {
    const params = {
      screen_name: screenName,
      screen_class: screenClass || screenName,
      session_id: this.sessionId,
    };

    await analytics().logScreenView(params);

    // Track screen view count
    const count = (this.screenViews.get(screenName) || 0) + 1;
    this.screenViews.set(screenName, count);

    if (__DEV__) {
      console.log(`[Analytics] Screen view: ${screenName} (${count})`);
    }
  }

  async logError(error: Error, context?: Record<string, any>) {
    try {
      await crashlytics().recordError(error);

      // Add custom keys
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          crashlytics().setAttribute(key, String(value));
        });
      }

      // Log as analytics event
      await this.logEvent(ANALYTICS_EVENTS.APP_CRASH, {
        error_message: error.message,
        error_stack: error.stack,
        ...context,
      });
    } catch (e) {
      console.warn('[Analytics] Failed to log error:', e);
    }
  }

  async logPurchase(productId: string, price: number, currency: string = 'BRL', quantity: number = 1) {
    await this.logEvent(ANALYTICS_EVENTS.PURCHASE, {
      product_id: productId,
      price,
      currency,
      quantity,
      value: price * quantity,
    });
  }

  async logAdImpression(adUnit: string, network: string, format: string) {
    await this.logEvent(ANALYTICS_EVENTS.AD_IMPRESSION, {
      ad_unit: adUnit,
      ad_network: network,
      ad_format: format,
    });
  }

  async logAdClick(adUnit: string, network: string) {
    await this.logEvent(ANALYTICS_EVENTS.AD_CLICK, {
      ad_unit: adUnit,
      ad_network: network,
    });
  }

  async logAdReward(adUnit: string, rewardType: string, rewardAmount: number) {
    await this.logEvent(ANALYTICS_EVENTS.AD_REWARD, {
      ad_unit: adUnit,
      reward_type: rewardType,
      reward_amount: rewardAmount,
    });
  }

  // Convenience methods for common events
  async trackAppOpen(coldStart: boolean = false) {
    await this.logEvent(ANALYTICS_EVENTS.APP_OPEN, { cold_start: coldStart });
  }

  async trackSignIn(method: 'email' | 'google' | 'apple') {
    await this.logEvent(
      method === 'email' ? ANALYTICS_EVENTS.SIGN_IN :
      method === 'google' ? ANALYTICS_EVENTS.SIGN_IN_GOOGLE :
      ANALYTICS_EVENTS.SIGN_IN_APPLE
    );
  }

  async trackSignUp(method: 'email' | 'google' | 'apple') {
    await this.logEvent(
      method === 'email' ? ANALYTICS_EVENTS.SIGN_UP :
      method === 'google' ? ANALYTICS_EVENTS.SIGN_UP_GOOGLE :
      ANALYTICS_EVENTS.SIGN_UP_APPLE
    );
  }

  async trackAnimeView(animeId: string, animeTitle: string, source: string) {
    await this.logEvent(ANALYTICS_EVENTS.ANIME_VIEW, {
      anime_id: animeId,
      anime_title: animeTitle,
      source,
    });
  }

  async trackPlayerEvent(event: EventName, animeId: string, episode: number, extraParams?: EventParams) {
    await this.logEvent(event, {
      anime_id: animeId,
      episode,
      ...extraParams,
    });
  }

  async trackDownloadEvent(event: EventName, animeId: string, episode: number, quality: string, extraParams?: EventParams) {
    await this.logEvent(event, {
      anime_id: animeId,
      episode,
      quality,
      ...extraParams,
    });
  }

  async trackSettingsChange(setting: string, value: string | number | boolean) {
    await this.logEvent(ANALYTICS_EVENTS.SETTINGS_CHANGE, {
      setting,
      value: String(value),
    });
  }

  async trackFeatureUse(feature: string, extraParams?: EventParams) {
    await this.logEvent(ANALYTICS_EVENTS.FEATURE_USE, {
      feature,
      ...extraParams,
    });
  }

  // Get screen view counts (for debugging)
  getScreenViewCounts(): Record<string, number> {
    return Object.fromEntries(this.screenViews);
  }

  // Reset session (for testing)
  resetSession() {
    this.sessionId = this.generateSessionId();
    this.screenViews.clear();
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;