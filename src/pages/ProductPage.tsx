import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useAppearance } from '../context/AppearanceContext';
import type { Product, ProductSize } from '../types/index';
import { api } from '../services/api';
import Loading from '../components/common/Loading';
import { getSiteOrigin } from '../utils/siteOrigin';
import { resolveMediaUrl } from '../utils/resolveMediaUrl';
import {
  applyGlobalDocumentSeo,
  removeJsonLd,
  setJsonLd,
  setCanonicalUrl,
  setHreflang,
} from '../utils/seoHead';

function truncateMeta(text: string, max = 160): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { settings } = useSiteSettings();
  const { appearance } = useAppearance();
  const origin = useMemo(() => getSiteOrigin(), []);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        setProduct(null);
        const data = await api.products.getById(id);
        setProduct(data);
        
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[1]?.size || data.sizes[0].size);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setProduct(null);
        setError('Не удалось загрузить товар');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const brand = settings.shopName?.trim() || 'Цветочный магазин';
    const fallbackOg = resolveMediaUrl(
      appearance.bannerBgImage || appearance.logoUrl || '/images/hero-flowers.jpg',
      origin,
    );

    if (!id) return;

    if (loading) {
      const preliminaryUrl = origin
        ? `${origin.replace(/\/$/, '')}/product/${id}`
        : `/product/${id}`;
      setCanonicalUrl(preliminaryUrl);
      setHreflang(preliminaryUrl);
      return;
    }

    if (error || !product) {
      const canonicalUrl = origin ? `${origin.replace(/\/$/, '')}/catalog` : '/catalog';
      applyGlobalDocumentSeo({
        title: `Товар не найден — ${brand}`,
        description: settings.seoDescription?.trim() || settings.shopTagline?.trim() || '',
        keywords: settings.seoKeywords?.trim() || undefined,
        canonicalUrl,
        ogImage: fallbackOg,
        siteName: brand,
      });
      removeJsonLd('jsonld-product');
      return;
    }

    const images = (product.images?.length ? product.images : [product.image])
      .map((u) => resolveMediaUrl(u, origin))
      .filter(Boolean);
    const title = `${product.name} — ${brand}`;
    const description = truncateMeta(product.description);
    const canonicalUrl = origin
      ? `${origin.replace(/\/$/, '')}/product/${product.id}`
      : `/product/${product.id}`;

    applyGlobalDocumentSeo({
      title,
      description,
      keywords: settings.seoKeywords?.trim() || undefined,
      canonicalUrl,
      ogImage: images[0] || fallbackOg,
      siteName: brand,
    });

    const price = product.price;
    const availability = product.inStock
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

    setJsonLd('jsonld-product', {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: images,
      sku: product.id,
      category: product.category,
      offers: {
        '@type': 'Offer',
        url: canonicalUrl,
        priceCurrency: 'RUB',
        price,
        availability,
      },
    });

    return () => {
      removeJsonLd('jsonld-product');
    };
  }, [
    loading,
    error,
    product,
    id,
    settings,
    appearance,
    origin,
  ]);

  if (loading) {
    return <Loading />;
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {error || 'Товар не найден'}
        </h1>
        <Link 
          to="/catalog" 
          className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  const getCurrentPrice = () => {
    if (selectedSize && product.sizes) {
      const sizePrice = product.sizes.find(s => s.size === selectedSize);
      return sizePrice ? sizePrice.price : product.price;
    }
    return product.price;
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize || undefined);
    setShowAddedNotification(true);
    setTimeout(() => setShowAddedNotification(false), 3000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize || undefined);
    navigate('/checkout');
  };

  const images = product.images || [product.image];

  return (
    <div className="min-h-screen bg-gradient-to-br from-elegant-50 to-primary-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link to="/" className="text-gray-500 hover:text-primary-600 transition-colors">
                Главная
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link to="/catalog" className="text-gray-500 hover:text-primary-600 transition-colors">
                Каталог
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img 
                  src={images[selectedImageIndex]} 
                  alt={product.name}
                  title={product.name}
                  className="w-full h-full object-cover"
                  decoding="async"
                  fetchPriority="high"
                  width={800}
                  height={800}
                />
              </div>
              
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index 
                          ? 'border-primary-600 ring-2 ring-primary-200' 
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`${product.name} - фото ${index + 1}`}
                        title={`${product.name} - фото ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        width={200}
                        height={200}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <div className="mb-2">
                <span className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                  {product.category}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-gray-900">
                    {getCurrentPrice().toLocaleString('ru-RU')} ₽
                  </span>
                  {product.inStock ? (
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      В наличии
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">Нет в наличии</span>
                  )}
                </div>
              </div>

              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Выберите размер:
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {product.sizes.map((sizeOption) => (
                      <button
                        key={sizeOption.size}
                        onClick={() => setSelectedSize(sizeOption.size)}
                        className={`py-3 px-4 rounded-lg border-2 font-semibold transition-all ${
                          selectedSize === sizeOption.size
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                        }`}
                      >
                        <div className="text-lg">{sizeOption.size}</div>
                        <div className="text-xs mt-1">
                          {sizeOption.price.toLocaleString('ru-RU')} ₽
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <p><strong>S</strong> - 15-25 цветов</p>
                    <p><strong>M</strong> - 25-35 цветов</p>
                    <p><strong>L</strong> - 35-50 цветов</p>
                    <p><strong>XL</strong> - 50+ цветов</p>
                  </div>
                </div>
              )}

              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Количество:
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors font-bold text-xl"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center py-2 border-x-2 border-gray-300 focus:outline-none font-semibold"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors font-bold text-xl"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-gray-600">
                    Итого: <span className="font-bold text-gray-900 text-xl">
                      {(getCurrentPrice() * quantity).toLocaleString('ru-RU')} ₽
                    </span>
                  </span>
                </div>
              </div>

              <div className="space-y-3 mt-auto">
                <button
                  onClick={handleBuyNow}
                  disabled={!product.inStock || (product.sizes && !selectedSize)}
                  className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Купить в 1 клик
                </button>
                
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || (product.sizes && !selectedSize)}
                  className="w-full bg-white text-primary-600 py-4 rounded-lg font-semibold text-lg border-2 border-primary-600 hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Добавить в корзину
                </button>
              </div>

              {showAddedNotification && (
                <div className="mt-4 bg-green-50 border-2 border-green-500 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Товар добавлен в корзину!
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Информация о доставке
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Бесплатная доставка при заказе от 5000 ₽
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Доставка в течение 2-4 часов
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Гарантия свежести цветов
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Фото букета перед доставкой
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Рекомендуем также
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Placeholder for related products */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
