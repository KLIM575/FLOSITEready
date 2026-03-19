import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types/index';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes?.[1]?.size || product.sizes?.[0]?.size;
    addToCart(product, 1, defaultSize);
  };

  const displayPrice = product.sizes && product.sizes.length > 0
    ? `от ${Math.min(...product.sizes.map(s => s.price)).toLocaleString('ru-RU')} ₽`
    : `${product.price.toLocaleString('ru-RU')} ₽`;

  return (
    <Link 
      to={`/product/${product.id}`}
      className="group block"
    >
      <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 h-full flex flex-col">
        <div className="aspect-square overflow-hidden bg-gray-100 relative">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
            {product.description}
          </p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-2xl font-bold text-gray-900">
              {displayPrice}
            </span>
            <button 
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
