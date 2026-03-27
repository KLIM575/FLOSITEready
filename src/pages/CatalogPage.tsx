import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/catalog/ProductCard';
import { PRODUCT_CATEGORIES } from '../constants';
import { api } from '../services/api';
import type { Product } from '../types/index';
import Loading from '../components/common/Loading';
import { useAppearance } from '../context/AppearanceContext';
import type { ProductCardStyle } from '../types/index';

const COLUMNS_GRID: Record<string, string> = {
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { appearance } = useAppearance();
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'Все'
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'Все') params.set('category', selectedCategory);
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, setSearchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const params: { category?: string; search?: string } = {};
        
        if (selectedCategory !== 'Все') {
          params.category = selectedCategory;
        }
        
        if (searchQuery.trim()) {
          params.search = searchQuery;
        }
        
        const data = await api.products.getAll(params);
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Не удалось загрузить товары. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [selectedCategory, searchQuery]);

  const categories = ['Все', ...PRODUCT_CATEGORIES];

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-elegant-50 to-primary-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <svg className="w-24 h-24 text-red-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ошибка загрузки</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-elegant-50 to-primary-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Каталог цветов</h1>
          <p className="text-xl text-gray-600">Выберите идеальный букет для вашего случая</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Поиск по названию или описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {products.length > 0 ? (
          <div className={`grid gap-8 ${COLUMNS_GRID[appearance.catalogColumns] ?? COLUMNS_GRID['3']}`}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cardStyle={appearance.productCardStyle as ProductCardStyle}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Ничего не найдено
            </h2>
            <p className="text-gray-600 mb-6">
              Попробуйте изменить параметры поиска или выбрать другую категорию
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Все');
              }}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
