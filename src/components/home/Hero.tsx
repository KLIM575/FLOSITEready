import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useAppearance } from '../../context/AppearanceContext';
import {
  HERO_IMAGE_SIZES,
  HERO_IMAGE_SRC,
  HERO_IMAGE_SRCSET_JPG,
  HERO_IMAGE_SRCSET_WEBP,
} from '../../constants';

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

  const hasBgColor = Boolean(appearance.bannerBgColor);
  /**
   * Для дефолтного баннера используем локальный <picture> с webp+jpg — src/srcset
   * совпадают с <link rel="preload"> в index.html, поэтому браузер не делает второй запрос.
   * Для кастомного bannerBgImage из админки формат/размеры заранее не известны,
   * рендерим обычный <img> без srcset.
   */
  const isCustomBanner = Boolean(appearance.bannerBgImage);
  const hasCustomBg = hasBgColor;

  const imgClassName = 'relative z-10 w-full h-auto rounded-2xl shadow-2xl object-cover';

  const btnText = appearance.bannerButtonText || 'Смотреть каталог';
  const btnLink = appearance.bannerButtonLink || '/catalog';

  const sectionStyle: React.CSSProperties = hasBgColor
    ? { backgroundColor: appearance.bannerBgColor }
    : {};

  return (
    <section
      className={`relative py-20 px-4 overflow-hidden ${
        hasBgColor ? '' : 'bg-gradient-to-br from-primary-50 via-white to-elegant-50'
      }`}
      style={sectionStyle}
    >
      {hasBgColor && <div className="absolute inset-0 bg-black/20" />}
      {!hasBgColor && (
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
            {isCustomBanner ? (
              <img
                src={appearance.bannerBgImage}
                alt="Красивый букет цветов"
                className={imgClassName}
                width={960}
                height={720}
                decoding="async"
                fetchPriority="high"
              />
            ) : (
              <picture>
                <source
                  type="image/webp"
                  srcSet={HERO_IMAGE_SRCSET_WEBP}
                  sizes={HERO_IMAGE_SIZES}
                />
                <img
                  src={HERO_IMAGE_SRC}
                  srcSet={HERO_IMAGE_SRCSET_JPG}
                  sizes={HERO_IMAGE_SIZES}
                  alt="Красивый букет цветов"
                  className={imgClassName}
                  width={960}
                  height={720}
                  decoding="async"
                  fetchPriority="high"
                />
              </picture>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
