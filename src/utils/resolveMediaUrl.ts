import { getSiteOrigin } from './siteOrigin';

/** Превращает относительные /uploads/... в абсолютный URL для og:image и JSON-LD. */
export function resolveMediaUrl(url: string | undefined | null, origin?: string): string {
  if (!url) return '';
  const base = origin ?? getSiteOrigin();
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/') && base) return `${base}${url}`;
  return url;
}
