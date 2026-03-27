import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useAppearance } from '../../context/AppearanceContext';

const Hero: React.FC = () => {
  const { settings } = useSiteSettings();
  const { appearance } = useAppearance();

  const title = settings.bannerEnabled && settings.bannerTitle
    ? settings.bannerTitle
    : 'Цветы, которые';
  const subtitle = settings.bannerEnabled && settings.bannerSubtitle
    ? settings.bannerSubtitle
    : 'Создаём неповторимые букеты для ваших особенных моментов. Свежие цветы, быстрая доставка, индивидуальный подход.';
  const showSecondLine = !(settings.bannerEnabled && settings.bannerTitle);

  const hasBgImage = Boolean(appearance.bannerBgImage);
  const hasBgColor = Boolean(appearance.bannerBgColor);
  const hasCustomBg = hasBgImage || hasBgColor;

  const btnText = appearance.bannerButtonText || 'Смотреть каталог';
  const btnLink = appearance.bannerButtonLink || '/catalog';

  const sectionStyle: React.CSSProperties = hasCustomBg
    ? {
        backgroundImage: hasBgImage ? `url(${appearance.bannerBgImage})` : undefined,
        backgroundColor: hasBgColor ? appearance.bannerBgColor : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

  return (
    <section
      className={`relative py-20 px-4 overflow-hidden ${
        hasCustomBg ? '' : 'bg-gradient-to-br from-primary-50 via-white to-elegant-50'
      }`}
      style={sectionStyle}
    >
      {hasCustomBg && (
        <div className="absolute inset-0 bg-black/30" />
      )}
      {!hasCustomBg && (
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5" />
      )}
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h1
              className={`text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight ${
                hasCustomBg ? 'text-white' : 'text-gray-900'
              }`}
            >
              {title}
              {showSecondLine && (
                <span className={`block ${hasCustomBg ? 'text-primary-300' : 'text-primary-600'}`}>
                  дарят радость
                </span>
              )}
            </h1>
            <p className={`text-xl mb-8 leading-relaxed ${hasCustomBg ? 'text-white/90' : 'text-gray-600'}`}>
              {subtitle}
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                to={btnLink}
                className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {btnText}
              </Link>
              <Link
                to="/about"
                className={`px-8 py-4 rounded-lg font-semibold border-2 transition-all ${
                  hasCustomBg
                    ? 'bg-white/10 text-white border-white/60 hover:bg-white/20'
                    : 'bg-white text-primary-600 border-primary-600 hover:bg-primary-50'
                }`}
              >
                Узнать больше
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-elegant-400 rounded-full blur-3xl opacity-20" />
            <img
              src="/images/hero-flowers.jpg"
              alt="Красивый букет цветов"
              className="relative z-10 w-full h-auto rounded-2xl shadow-2xl"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=800&fit=crop';
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
