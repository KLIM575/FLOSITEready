import { Helmet } from 'react-helmet-async';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useAppearance } from '../../context/AppearanceContext';
import { getSiteOrigin } from '../../utils/siteOrigin';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';
import { useMemo } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export default function SEO({
  title,
  description,
  keywords,
  canonicalPath,
  ogType = 'website',
  ogImage,
  noindex = false,
  jsonLd,
}: SEOProps) {
  const { settings } = useSiteSettings();
  const { appearance } = useAppearance();
  const origin = useMemo(() => getSiteOrigin(), []);

  const siteName = settings.shopName?.trim() || 'Цветочный магазин';
  const siteDescription =
    settings.seoDescription?.trim() ||
    settings.shopTagline?.trim() ||
    'Свежие цветы и букеты с доставкой.';
  const siteKeywords = settings.seoKeywords?.trim();

  const pageTitle = title ? `${title} — ${siteName}` : siteName;
  const pageDescription = description || siteDescription;
  const pageKeywords = keywords || siteKeywords;

  const canonicalUrl = canonicalPath
    ? `${origin?.replace(/\/$/, '') || ''}${canonicalPath}`
    : undefined;

  const defaultOgImage = resolveMediaUrl(
    appearance.bannerBgImage || appearance.logoUrl || '/images/hero-flowers.jpg',
    origin
  );
  const pageOgImage = ogImage ? resolveMediaUrl(ogImage, origin) : defaultOgImage;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {pageKeywords && <meta name="keywords" content={pageKeywords} />}
      
      <meta
        name="robots"
        content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}
      />

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {canonicalUrl && <link rel="alternate" hrefLang="ru" href={canonicalUrl} />}
      {canonicalUrl && <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />}

      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {pageOgImage && <meta property="og:image" content={pageOgImage} />}
      <meta property="og:locale" content="ru_RU" />

      <meta name="twitter:card" content={pageOgImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {pageOgImage && <meta name="twitter:image" content={pageOgImage} />}

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
