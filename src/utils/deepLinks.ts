/**
 * Tomato Animes - Deep Link Utilities
 * Parse and handle deep links for the app
 */

import { Linking, Platform } from 'react-native';
import { router } from 'expo-router';

export interface DeepLinkData {
  type: 'anime' | 'episode' | 'user' | 'search' | 'settings' | 'unknown';
  animeId?: string;
  episode?: number;
  userId?: string;
  query?: string;
  section?: string;
  rawUrl: string;
}

const APP_SCHEME = 'tomatoanimes';
const WEB_DOMAIN = 'tomatoanimes.com';

/**
 * Parse a deep link URL and extract relevant data
 */
export function parseDeepLink(url: string): DeepLinkData {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    const pathname = parsedUrl.pathname;
    const searchParams = parsedUrl.searchParams;

    // Handle app scheme links (tomatoanimes://...)
    if (parsedUrl.protocol === `${APP_SCHEME}:`) {
      return parseAppScheme(parsedUrl);
    }

    // Handle web domain links (https://tomatoanimes.com/...)
    if (hostname === WEB_DOMAIN || hostname === `www.${WEB_DOMAIN}`) {
      return parseWebDomain(pathname, searchParams);
    }

    // Handle universal links (iOS associated domains)
    if (hostname.endsWith(WEB_DOMAIN)) {
      return parseWebDomain(pathname, searchParams);
    }

    return { type: 'unknown', rawUrl: url };
  } catch (error) {
    console.warn('[DeepLink] Failed to parse URL:', url, error);
    return { type: 'unknown', rawUrl: url };
  }
}

function parseAppScheme(url: URL): DeepLinkData {
  const path = url.pathname.replace(/^\//, '');
  const segments = path.split('/').filter(Boolean);
  const searchParams = url.searchParams;

  switch (segments[0]) {
    case 'watch':
      return {
        type: 'anime',
        animeId: segments[1],
        episode: segments[2] ? parseInt(segments[2], 10) : undefined,
        rawUrl: url.toString(),
      };
    case 'episode':
      return {
        type: 'episode',
        animeId: segments[1],
        episode: parseInt(segments[2], 10),
        rawUrl: url.toString(),
      };
    case 'user':
      return {
        type: 'user',
        userId: segments[1],
        rawUrl: url.toString(),
      };
    case 'search':
      return {
        type: 'search',
        query: searchParams.get('q') || undefined,
        rawUrl: url.toString(),
      };
    case 'settings':
      return {
        type: 'settings',
        section: segments[1],
        rawUrl: url.toString(),
      };
    default:
      return { type: 'unknown', rawUrl: url.toString() };
  }
}

function parseWebDomain(pathname: string, searchParams: URLSearchParams): DeepLinkData {
  const segments = pathname.split('/').filter(Boolean);

  if (segments[0] === 'watch') {
    return {
      type: 'anime',
      animeId: segments[1],
      episode: segments[2] ? parseInt(segments[2], 10) : undefined,
      rawUrl: `https://${WEB_DOMAIN}${pathname}`,
    };
  }

  if (segments[0] === 'user') {
    return {
      type: 'user',
      userId: segments[1],
      rawUrl: `https://${WEB_DOMAIN}${pathname}`,
    };
  }

  if (segments[0] === 'search') {
    return {
      type: 'search',
      query: searchParams.get('q') || undefined,
      rawUrl: `https://${WEB_DOMAIN}${pathname}`,
    };
  }

  return { type: 'unknown', rawUrl: `https://${WEB_DOMAIN}${pathname}` };
}

/**
 * Generate a deep link URL for the app
 */
export function generateDeepLink(data: Partial<DeepLinkData> & { type: DeepLinkData['type'] }): string {
  switch (data.type) {
    case 'anime':
      return `${APP_SCHEME}://watch/${data.animeId}${data.episode ? `/${data.episode}` : ''}`;
    case 'episode':
      return `${APP_SCHEME}://episode/${data.animeId}/${data.episode}`;
    case 'user':
      return `${APP_SCHEME}://user/${data.userId}`;
    case 'search':
      return `${APP_SCHEME}://search${data.query ? `?q=${encodeURIComponent(data.query)}` : ''}`;
    case 'settings':
      return `${APP_SCHEME}://settings${data.section ? `/${data.section}` : ''}`;
    default:
      return `${APP_SCHEME}://`;
  }
}

/**
 * Generate a web URL for sharing
 */
export function generateWebUrl(data: Partial<DeepLinkData> & { type: DeepLinkData['type'] }): string {
  switch (data.type) {
    case 'anime':
      return `https://${WEB_DOMAIN}/watch/${data.animeId}${data.episode ? `/${data.episode}` : ''}`;
    case 'episode':
      return `https://${WEB_DOMAIN}/watch/${data.animeId}/${data.episode}`;
    case 'user':
      return `https://${WEB_DOMAIN}/user/${data.userId}`;
    case 'search':
      return `https://${WEB_DOMAIN}/search${data.query ? `?q=${encodeURIComponent(data.query)}` : ''}`;
    default:
      return `https://${WEB_DOMAIN}`;
  }
}

/**
 * Handle incoming deep link and navigate accordingly
 */
export function handleDeepLink(url: string): boolean {
  const data = parseDeepLink(url);

  switch (data.type) {
    case 'anime':
      if (data.animeId) {
        if (data.episode) {
          router.push(`/player?animeId=${data.animeId}&episode=${data.episode}`);
        } else {
          router.push(`/player?animeId=${data.animeId}`);
        }
        return true;
      }
      break;

    case 'episode':
      if (data.animeId && data.episode) {
        router.push(`/player?animeId=${data.animeId}&episode=${data.episode}`);
        return true;
      }
      break;

    case 'user':
      if (data.userId) {
        // Navigate to user profile
        router.push(`/profile?userId=${data.userId}`);
        return true;
      }
      break;

    case 'search':
      if (data.query) {
        router.push(`/search?query=${encodeURIComponent(data.query)}`);
      } else {
        router.push('/search');
      }
      return true;

    case 'settings':
      if (data.section) {
        router.push(`/settings?section=${data.section}`);
      } else {
        router.push('/settings');
      }
      return true;
  }

  return false;
}

/**
 * Set up deep link listeners
 */
export function setupDeepLinkListeners(
  onLink: (url: string) => void
): () => void {
  // Handle links when app is already open
  const subscription = Linking.addEventListener('url', ({ url }) => {
    onLink(url);
  });

  // Handle initial link when app is opened from closed state
  Linking.getInitialURL().then(url => {
    if (url) {
      onLink(url);
    }
  });

  return () => {
    subscription.remove();
  };
}

/**
 * Check if a URL can be handled by the app
 */
export function canHandleUrl(url: string): boolean {
  const data = parseDeepLink(url);
  return data.type !== 'unknown';
}

/**
 * Open a URL in the appropriate way (app or browser)
 */
export async function openUrl(url: string, preferApp: boolean = true): Promise<boolean> {
  const data = parseDeepLink(url);

  if (preferApp && canHandleUrl(url)) {
    // Try to open in app
    const appUrl = generateDeepLink(data as any);
    const supported = await Linking.canOpenURL(appUrl);
    if (supported) {
      await Linking.openURL(appUrl);
      return true;
    }
  }

  // Fall back to web browser
  const webUrl = generateWebUrl(data as any);
  const supported = await Linking.canOpenURL(webUrl);
  if (supported) {
    await Linking.openURL(webUrl);
    return true;
  }

  return false;
}