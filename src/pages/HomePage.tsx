import React, { useMemo } from 'react';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import FeaturedProducts from '../components/home/FeaturedProducts';
import CallToAction from '../components/home/CallToAction';
import SEO from '../components/seo/SEO';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useAppearance } from '../context/AppearanceContext';
import { getSiteOrigin } from '../utils/siteOrigin';
import { resolveMediaUrl } from '../utils/resolveMediaUrl';

const HomePage: React.FC = () => {
  const { settings } = useSiteSettings();
  const { appearance } = useAppearance();
  const origin = useMemo(() => getSiteOrigin(), []);

  const siteName = settings.shopName?.trim() || 'Цветочный магазин';
  const logoUrl = resolveMediaUrl(appearance.logoUrl, origin);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: siteName,
        url: origin || undefined,
        description: settings.seoDescription?.trim() || settings.shopTagline?.trim() || 'Свежие цветы и букеты с доставкой.',
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
        name: siteName,
        url: origin || undefined,
        ...(logoUrl ? { logo: logoUrl } : {}),
        contactPoint: settings.contactPhone ? {
          '@type': 'ContactPoint',
          telephone: settings.contactPhone,
          contactType: 'customer service',
          areaServed: 'RU',
          availableLanguage: 'Russian',
        } : undefined,
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${origin}/#localbusiness`,
        name: siteName,
        url: origin || undefined,
        ...(logoUrl ? { image: logoUrl } : {}),
        ...(settings.contactPhone ? { telephone: settings.contactPhone } : {}),
        ...(settings.contactEmail ? { email: settings.contactEmail } : {}),
        ...(settings.contactAddress ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: settings.contactAddress,
            addressCountry: 'RU',
          },
        } : {}),
        priceRange: '₽₽',
      },
    ],
  };

  return (
    <>
      <SEO
        title={settings.seoTitle?.trim() || undefined}
        canonicalPath="/"
        jsonLd={jsonLd}
      />
      <div className="min-h-screen">
        <Hero />
        <Features />
        <FeaturedProducts />
        <CallToAction />
      </div>
    </>
  );
};

export default HomePage;
