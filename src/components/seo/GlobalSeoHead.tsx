import { useEffect, useMemo } from 'react';
import { useLocation, useMatch } from 'react-router-dom';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useAppearance } from '../../context/AppearanceContext';
import { getSiteOrigin } from '../../utils/siteOrigin';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';
import {
  applyGlobalDocumentSeo,
  removeJsonLd,
  setJsonLd,
} from '../../utils/seoHead';

const ROUTE_LABEL: Record<string, string> = {
  '/catalog': 'Каталог',
  '/cart': 'Корзина',
  '/checkout': 'Оформление заказа',
  '/profile': 'Профиль',
  '/about': 'О нас',
  '/contacts': 'Контакты',
  '/admin': 'Админ',
};

function buildTitle(pathname: string, brand: string, seoTitle: string): string {
  if (pathname === '/' && seoTitle) return seoTitle;
  const extra = ROUTE_LABEL[pathname];
  if (extra) return `${extra} — ${brand}`;
  if (seoTitle) return seoTitle;
  return brand;
}

export default function GlobalSeoHead() {
  const { pathname } = useLocation();
  const isProduct = Boolean(useMatch('/catalog/:slug'));
  const { settings } = useSiteSettings();
  const { appearance } = useAppearance();
  const origin = useMemo(() => getSiteOrigin(), []);

  useEffect(() => {
    if (isProduct) return;

    const brand = settings.shopName?.trim() || 'Цветочный магазин';
    const seoTitle = settings.seoTitle?.trim() || '';
    const title = buildTitle(pathname, brand, seoTitle);
    const description =
      settings.seoDescription?.trim() ||
      settings.shopTagline?.trim() ||
      'Свежие цветы и букеты с доставкой.';
    const keywords = settings.seoKeywords?.trim();

    const canonicalUrl = origin
      ? `${origin.replace(/\/$/, '')}${pathname === '/' ? '/' : pathname}`
      : pathname;

    let ogImage = '';
    for (const u of [appearance.bannerBgImage, appearance.logoUrl, '/images/hero-flowers.jpg']) {
      const r = resolveMediaUrl(u, origin);
      if (r) {
        ogImage = r;
        break;
      }
    }

    applyGlobalDocumentSeo({
      title,
      description,
      keywords: keywords || undefined,
      canonicalUrl,
      ogImage,
      siteName: brand,
    });

    if (pathname === '/') {
      const logoUrl = resolveMediaUrl(appearance.logoUrl, origin);
      setJsonLd('jsonld-site', {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            name: brand,
            url: origin || undefined,
            description,
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${origin}/catalog?search={search_term_string}`,
              },
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@type': 'Organization',
            name: brand,
            url: origin || undefined,
            ...(logoUrl ? { logo: logoUrl } : {}),
          },
        ],
      });
    } else {
      removeJsonLd('jsonld-site');
    }
  }, [isProduct, pathname, settings, appearance, origin]);

  return null;
}
