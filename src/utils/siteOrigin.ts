/**
 * Абсолютный origin сайта для canonical и Open Graph.
 * В продакшене задайте VITE_SITE_URL=https://ваш-домен.ru (без слэша в конце).
 */
export function getSiteOrigin(): string {
  const fromEnv = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}
