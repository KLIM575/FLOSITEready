import React, { useState, useMemo } from 'react';
import { mockProducts } from '../data/products';
import ProductCard from '../components/catalog/ProductCard';
import { PRODUCT_CATEGORIES } from '../constants';

const CatalogPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product => {
      const matchesCategory = selectedCategory === 'Все' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const categories = ['Все', ...PRODUCT_CATEGORIES];

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

        {filteredProducts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
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
