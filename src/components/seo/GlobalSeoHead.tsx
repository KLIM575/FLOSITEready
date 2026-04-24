import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useAppearance } from '../../context/AppearanceContext';
import { getSiteOrigin } from '../../utils/siteOrigin';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';

export default function GlobalSeoHead() {
  const { pathname } = useLocation();
  const { settings } = useSiteSettings();
  const { appearance } = useAppearance();
  const origin = useMemo(() => getSiteOrigin(), []);

  const siteName = settings.shopName?.trim() || 'Цветочный магазин';
  const siteDescription =
    settings.seoDescription?.trim() ||
    settings.shopTagline?.trim() ||
    'Свежие цветы и букеты с доставкой.';

  const canonicalUrl = origin
    ? `${origin.replace(/\/$/, '')}${pathname === '/' ? '/' : pathname}`
    : undefined;

  const ogImage = resolveMediaUrl(
    appearance.bannerBgImage || appearance.logoUrl || '/images/hero-flowers.jpg',
    origin
  );

  return (
    <Helmet
      defaultTitle={siteName}
      titleTemplate={`%s — ${siteName}`}
    >
      <html lang="ru" />
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#ec4899" />
      
      <meta name="description" content={siteDescription} />
      {settings.seoKeywords && <meta name="keywords" content={settings.seoKeywords} />}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      
      <meta name="author" content={siteName} />
      <meta name="format-detection" content="telephone=no" />
      
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {canonicalUrl && <link rel="alternate" hrefLang="ru" href={canonicalUrl} />}
      {canonicalUrl && <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />}
      
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:type" content="website" />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta property="og:image:width" content="1200" />}
      {ogImage && <meta property="og:image:height" content="630" />}
      
      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:site" content={siteName} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      
      <meta name="geo.region" content="RU" />
      <meta name="geo.placename" content="Russia" />
      
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
    </Helmet>
  );
}
