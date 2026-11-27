/**
 * Tomato Animes - Date Utilities
 * Date formatting and manipulation helpers
 */

/**
 * Format a date to relative time (e.g., "2 hours ago", "Yesterday")
 */
export function formatRelativeTime(date: Date | string | number, locale: string = 'pt-BR'): string {
  const targetDate = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - targetDate.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffSecs < 60) {
    return rtf.format(-diffSecs, 'second');
  }
  if (diffMins < 60) {
    return rtf.format(-diffMins, 'minute');
  }
  if (diffHours < 24) {
    return rtf.format(-diffHours, 'hour');
  }
  if (diffDays < 7) {
    if (diffDays === 1) return 'Ontem';
    return rtf.format(-diffDays, 'day');
  }
  if (diffWeeks < 4) {
    return rtf.format(-diffWeeks, 'week');
  }
  if (diffMonths < 12) {
    return rtf.format(-diffMonths, 'month');
  }
  return rtf.format(-diffYears, 'year');
}

/**
 * Format a date to a short string (e.g., "Jan 15, 2024")
 */
export function formatShortDate(date: Date | string | number, locale: string = 'pt-BR'): string {
  const targetDate = date instanceof Date ? date : new Date(date);
  return targetDate.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date to a long string (e.g., "15 de janeiro de 2024")
 */
export function formatLongDate(date: Date | string | number, locale: string = 'pt-BR'): string {
  const targetDate = date instanceof Date ? date : new Date(date);
  return targetDate.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format a date to time only (e.g., "14:30")
 */
export function formatTime(date: Date | string | number, locale: string = 'pt-BR', hour24: boolean = true): string {
  const targetDate = date instanceof Date ? date : new Date(date);
  return targetDate.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !hour24,
  });
}

/**
 * Format a date to date and time (e.g., "15/01/2024 14:30")
 */
export function formatDateTime(date: Date | string | number, locale: string = 'pt-BR'): string {
  const targetDate = date instanceof Date ? date : new Date(date);
  return targetDate.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Format duration in milliseconds to human readable string
 */
export function formatDuration(ms: number, short: boolean = false): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (short) {
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  if (days > 0) return `${days} dia${days > 1 ? 's' : ''} ${hours % 24} hora${hours % 24 !== 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''} ${minutes % 60} minuto${minutes % 60 !== 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minuto${minutes > 1 ? 's' : ''} ${seconds % 60} segundo${seconds % 60 !== 1 ? 's' : ''}`;
  return `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
}

/**
 * Format duration in minutes to human readable string
 */
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

/**
 * Format a timestamp to MM:SS or HH:MM:SS
 */
export function formatTimestamp(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get start of day for a date
 */
export function startOfDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day for a date
 */
export function endOfDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string | number): boolean {
  const target = date instanceof Date ? date : new Date(date);
  const today = new Date();
  return target.toDateString() === today.toDateString();
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: Date | string | number): boolean {
  const target = date instanceof Date ? date : new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return target.toDateString() === yesterday.toDateString();
}

/**
 * Check if date is this week
 */
export function isThisWeek(date: Date | string | number): boolean {
  const target = date instanceof Date ? date : new Date(date);
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return target >= startOfWeek && target <= endOfWeek;
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Subtract days from a date
 */
export function subDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

/**
 * Get difference in days between two dates
 */
export function diffDays(date1: Date, date2: Date): number {
  const d1 = startOfDay(date1);
  const d2 = startOfDay(date2);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Format release schedule (e.g., "Domingos às 14:00")
 */
export function formatSchedule(dayOfWeek: number, time: string, locale: string = 'pt-BR'): string {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const dayName = days[dayOfWeek] || 'Desconhecido';
  return `${dayName}s às ${time}`;
}

/**
 * Get next episode air date based on schedule
 */
export function getNextAirDate(dayOfWeek: number, time: string): Date {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);

  let targetDate = new Date(now);
  targetDate.setHours(hours, minutes, 0, 0);

  const currentDay = now.getDay();
  let daysUntil = dayOfWeek - currentDay;

  if (daysUntil <= 0 || (daysUntil === 0 && now >= targetDate)) {
    daysUntil += 7;
  }

  targetDate.setDate(now.getDate() + daysUntil);
  return targetDate;
}