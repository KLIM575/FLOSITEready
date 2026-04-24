import { getSiteOrigin } from './siteOrigin';
import { resolveMediaUrl } from './resolveMediaUrl';

const PRELOAD_ID = 'catalog-lcp-image-preload';

/**
 * Подсказка браузеру начать загрузку первого изображения каталога параллельно с разбором DOM —
 * короче цепочка «JS → разметка → запрос картинки» в панели Network / LCP.
 */
export function setCatalogHeroImagePreload(imageUrl: string | undefined): void {
  const href = resolveMediaUrl(imageUrl, getSiteOrigin());
  if (!href) {
    document.getElementById(PRELOAD_ID)?.remove();
    return;
  }

  let link = document.getElementById(PRELOAD_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = PRELOAD_ID;
    link.rel = 'preload';
    link.as = 'image';
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
  }
  link.href = href;
}

export function clearCatalogHeroImagePreload(): void {
  document.getElementById(PRELOAD_ID)?.remove();
}
