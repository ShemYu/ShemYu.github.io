import type { Lang } from '../i18n';

export function formatDate(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-Hant' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
