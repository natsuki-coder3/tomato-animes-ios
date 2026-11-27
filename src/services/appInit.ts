/**
 * Tomato Animes - App Initialization
 * Initialize all services on app startup
 */

import { analyticsService } from './analytics';
import { storage } from './storage';
import { api } from './api';
import { authStore } from '@store/authStore';
import { settingsStore } from '@store/settingsStore';

export async function initializeApp(): Promise<void> {
  console.log('[AppInit] Starting app initialization...');

  try {
    // Initialize analytics
    await analyticsService.initialize();
    console.log('[AppInit] Analytics initialized');

    // Initialize storage
    await storage.incrementAppOpenCount();
    console.log('[AppInit] Storage initialized');

    // Check for app version change
    const lastVersion = storage.getLastAppVersion();
    const currentVersion = '1.6.1';

    if (lastVersion !== currentVersion) {
      console.log('[AppInit] Version changed:', lastVersion, '->', currentVersion);
      // Run migration if needed
      await migrateApp(lastVersion, currentVersion);
      storage.setLastAppVersion(currentVersion);
    }

    // Initialize auth store
    await authStore.initialize();
    console.log('[AppInit] Auth store initialized');

    // Initialize settings store
    await settingsStore.initialize();
    console.log('[AppInit] Settings store initialized');

    // Set auth token in API
    const token = storage.getAuthToken();
    if (token) {
      api.setAuthToken(token);
    }

    console.log('[AppInit] App initialization complete');
  } catch (error) {
    console.error('[AppInit] Initialization failed:', error);
    // Don't throw - allow app to continue with degraded functionality
  }
}

async function migrateApp(fromVersion: string | undefined, toVersion: string): Promise<void> {
  if (!fromVersion) {
    // First install
    console.log('[AppInit] First install detected');
    return;
  }

  const fromMajor = parseInt(fromVersion.split('.')[0]);
  const toMajor = parseInt(toVersion.split('.')[0]);

  if (fromMajor < toMajor) {
    // Major version migration
    console.log('[AppInit] Major version migration needed');
    // Clear cache on major version change
    storage.clearAllCache();
  }

  // Add specific migration logic here
  // e.g., migrate settings structure, update cache format, etc.
}

export async function initializeAuth(): Promise<void> {
  await authStore.initialize();
}

export async function handleDeepLink(url: string): Promise<void> {
  // Handle deep links like tomatoanimes://watch/123
  console.log('[AppInit] Handling deep link:', url);

  try {
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname;

    if (path.startsWith('/watch/')) {
      const animeId = path.replace('/watch/', '');
      // Navigate to player
      // This will be handled by the router
    } else if (path.startsWith('/user/')) {
      const userId = path.replace('/user/', '');
      // Navigate to profile
    }
  } catch (error) {
    console.warn('[AppInit] Failed to parse deep link:', error);
  }
}