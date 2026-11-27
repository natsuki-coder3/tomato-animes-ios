/**
 * Tomato Animes - Formatters
 * Number, string, and data formatting utilities
 */

/**
 * Format number with abbreviations (K, M, B)
 */
export function formatNumber(num: number, decimals: number = 1): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(decimals).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(decimals).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(decimals).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

/**
 * Format number with locale-specific formatting
 */
export function formatNumberLocale(num: number, locale: string = 'pt-BR'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format file size in bytes to human readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Format speed in bytes/sec to human readable string
 */
export function formatSpeed(bytesPerSec: number): string {
  return formatBytes(bytesPerSec) + '/s';
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format rating (0-10) to stars
 */
export function formatRating(rating: number, maxStars: number = 5): string {
  const stars = Math.round(rating / (10 / maxStars));
  return '★'.repeat(stars) + '☆'.repeat(maxStars - stars);
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number, ellipsis: string = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Capitalize first letter of each word
 */
export function capitalize(str: string): string {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Convert string to title case
 */
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, txt =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Generate initials from name
 */
export function getInitials(name: string, maxInitials: number = 2): string {
  return name
    .split(' ')
    .map(part => part[0])
    .slice(0, maxInitials)
    .join('')
    .toUpperCase();
}

/**
 * Slugify string for URLs
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format genre list
 */
export function formatGenres(genres: string[], max: number = 3): string {
  if (!genres.length) return '';
  if (genres.length <= max) return genres.join(', ');
  return genres.slice(0, max).join(', ') + ` +${genres.length - max} mais`;
}

/**
 * Format studio list
 */
export function formatStudios(studios: string[], max: number = 2): string {
  if (!studios.length) return '';
  if (studios.length <= max) return studios.join(', ');
  return studios.slice(0, max).join(', ') + ` +${studios.length - max} mais`;
}

/**
 * Format anime type for display
 */
export function formatAnimeType(type: string): string {
  const types: Record<string, string> = {
    TV: 'TV',
    Movie: 'Filme',
    OVA: 'OVA',
    ONA: 'ONA',
    Special: 'Especial',
    Music: 'Música',
  };
  return types[type] || type;
}

/**
 * Format anime status for display
 */
export function formatAnimeStatus(status: string): string {
  const statuses: Record<string, string> = {
    Airing: 'Em Exibição',
    Finished: 'Finalizado',
    Upcoming: 'Próximos Lançamentos',
    NotYetAired: 'Não Exibido',
  };
  return statuses[status] || status;
}

/**
 * Format episode number with prefix
 */
export function formatEpisodeNumber(episode: number, total?: number): string {
  if (total) {
    return `EP ${episode}/${total}`;
  }
  return `EP ${episode}`;
}

/**
 * Format season/year
 */
export function formatSeasonYear(season?: string, year?: number): string {
  if (!season && !year) return '';
  if (season && year) return `${season} ${year}`;
  if (season) return season;
  return year.toString();
}

/**
 * Format age rating
 */
export function formatAgeRating(rating: string): string {
  const ratings: Record<string, string> = {
    G: 'Livre',
    PG: '10+',
    PG13: '12+',
    R17: '16+',
    R: '18+',
    RX: '18+',
  };
  return ratings[rating] || rating;
}

/**
 * Format video quality for display
 */
export function formatQuality(quality: string): string {
  const qualities: Record<string, string> = {
    '1080p': '1080p (Full HD)',
    '720p': '720p (HD)',
    '480p': '480p (SD)',
    '360p': '360p',
    'Auto': 'Automático',
  };
  return qualities[quality] || quality;
}

/**
 * Format language code to display name
 */
export function formatLanguage(code: string): string {
  const languages: Record<string, string> = {
    'pt-BR': 'Português (Brasil)',
    'pt-PT': 'Português (Portugal)',
    'en-US': 'English (US)',
    'en-GB': 'English (UK)',
    'es-ES': 'Español',
    'es-MX': 'Español (México)',
    'ja-JP': '日本語',
    'ko-KR': '한국어',
    'zh-CN': '中文 (简体)',
    'zh-TW': '中文 (繁體)',
    'fr-FR': 'Français',
    'de-DE': 'Deutsch',
    'it-IT': 'Italiano',
    'ru-RU': 'Русский',
    'ar-SA': 'العربية',
  };
  return languages[code] || code;
}

/**
 * Format currency (BRL)
 */
export function formatCurrency(amount: number, currency: string = 'BRL', locale: string = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Parse query string to object
 */
export function parseQueryString(query: string): Record<string, string> {
  const params = new URLSearchParams(query);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}

/**
 * Format search query for API
 */
export function formatSearchQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/[^\w\sÀ-ſ-]/g, '') // Keep letters, numbers, spaces, hyphens, and accented chars
    .replace(/\s+/g, ' ');
}

/**
 * Highlight search terms in text
 */
export function highlightTerms(text: string, terms: string[]): string {
  if (!terms.length) return text;

  const escapedTerms = terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');

  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Generate random string
 */
export function randomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}