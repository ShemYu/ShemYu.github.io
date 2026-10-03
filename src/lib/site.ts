import type { Lang } from '../i18n';

export const SITE_ORIGIN = 'https://shemyu.github.io';

export const social = {
  github: 'https://github.com/ShemYu',
  linkedin: 'https://www.linkedin.com/in/shem-yu-a10494219',
  x: 'https://x.com/ShemYu',
};

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalized, SITE_ORIGIN).href;
}

export function htmlLang(lang: Lang): string {
  return lang === 'zh' ? 'zh-Hant' : 'en';
}

export function ogLocale(lang: Lang): string {
  return lang === 'zh' ? 'zh_TW' : 'en_US';
}

export function hreflang(lang: Lang): string {
  return lang === 'zh' ? 'zh-Hant' : 'en';
}

export function feedPaths(lang: Lang): { rss: string; atom: string } {
  if (lang === 'zh') return { rss: '/zh/rss.xml', atom: '/zh/atom.xml' };
  return { rss: '/rss.xml', atom: '/atom.xml' };
}
