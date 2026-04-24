export const PRODUCT_CATEGORIES = [
  'Букеты',
  'Розы',
  'Тюльпаны',
  'Пионы',
  'Орхидеи',
  'Композиции',
  'Подарочные наборы',
] as const;

/**
 * LCP-картинка главного баннера. Физически лежит в `public/images/hero/`
 * (скачана с Unsplash, поэтому CDN-запрос при первом визите не требуется).
 * Значения ДОЛЖНЫ совпадать 1-в-1 с <link rel="preload"> в index.html,
 * иначе preload не применится и браузер сделает второй запрос.
 *
 * Файлы заранее сжаты: webp в 1.5-2 раза легче jpg при том же качестве,
 * поэтому WebP-вариант используется в <source>, а JPG — как фолбэк для
 * совсем древних браузеров (<Safari 14 / <Chrome 32 / <Firefox 65).
 */
export const HERO_IMAGE_SRC = '/images/hero/hero-flowers-960.jpg';

export const HERO_IMAGE_SRCSET_WEBP = [
  '/images/hero/hero-flowers-480.webp 480w',
  '/images/hero/hero-flowers-768.webp 768w',
  '/images/hero/hero-flowers-960.webp 960w',
  '/images/hero/hero-flowers-1280.webp 1280w',
  '/images/hero/hero-flowers-1600.webp 1600w',
].join(', ');

export const HERO_IMAGE_SRCSET_JPG = [
  '/images/hero/hero-flowers-480.jpg 480w',
  '/images/hero/hero-flowers-960.jpg 960w',
  '/images/hero/hero-flowers-1280.jpg 1280w',
].join(', ');

export const HERO_IMAGE_SIZES = '(max-width: 768px) 100vw, 50vw';
