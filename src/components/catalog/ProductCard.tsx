import React from 'react';
import { Link } from 'react-router-dom';
import type { Product, ProductCardStyle } from '../../types/index';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  cardStyle?: ProductCardStyle;
  /** Первые карточки в сетке: eager + fetchPriority high — лучше LCP в каталоге */
  imageLoading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  /** Под фактическую сетку колонок (меньше лишних байт на мобильных) */
  imageSizes?: string;
  /** Откладывает отрисовку вне экрана — меньше работы main thread при скролле */
  deferPaint?: boolean;
}

const CARD_STYLE_CLASS: Record<ProductCardStyle, string> = {
  default:  'shadow-lg hover:shadow-2xl',
  minimal:  'shadow-none border border-gray-100 hover:shadow-md',
  bordered: 'shadow-none border-2 border-gray-200 hover:border-primary-300',
};

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cardStyle = 'default',
  imageLoading = 'lazy',
  fetchPriority = 'auto',
  imageSizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  deferPaint = false,
}) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes?.[1]?.size || product.sizes?.[0]?.size;
    addToCart(product, 1, defaultSize);
  };

  const shortDescription = product.description.length > 90
    ? product.description.slice(0, 90).trimEnd() + '...'
    : product.description;

  const displayPrice = product.sizes && product.sizes.length > 0
    ? `от ${Math.min(...product.sizes.map(s => s.price)).toLocaleString('ru-RU')} ₽`
    : `${product.price.toLocaleString('ru-RU')} ₽`;

  return (
    <Link 
      to={`/product/${product.id}`}
      className="group block"
    >
      <div
        className={`bg-white rounded-xl overflow-hidden transition-all transform hover:-translate-y-2 h-full flex flex-col ${CARD_STYLE_CLASS[cardStyle]}${
          deferPaint ? ' [content-visibility:auto] [contain-intrinsic-size:320px_420px]' : ''
        }`}
      >
        <div className="aspect-square overflow-hidden bg-gray-100 relative">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading={imageLoading}
            decoding="async"
            width={600}
            height={600}
            sizes={imageSizes}
            {...(fetchPriority !== 'auto' ? { fetchPriority } : {})}
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold">
                Нет в наличии
              </span>
            </div>
          )}
        </div>
        <div className="p-6 flex flex-col flex-1">
          <span className="text-sm text-primary-600 font-medium">
            {product.category}
          </span>
          <h3 className="text-lg font-semibold text-gray-900 mt-2 mb-3 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mb-4 flex-1">
            {shortDescription}
          </p>
          <div className="flex items-center justify-between mt-auto gap-2">
            <span className="text-xl font-bold text-gray-900 whitespace-nowrap">
              {displayPrice}
            </span>
            <button 
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
            >
              В корзину
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
