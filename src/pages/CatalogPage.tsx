/**
 * Каталог: LCP и сеть
 * - fetchPriority=high только у первой карточки (один «главный» запрос картинки для Lighthouse).
 * - Первая строка сетки: eager без high — не перетягивают полосу у LCP.
 * - Остальное: lazy + low + content-visibility; preload href — только первое фото.
 * - Поиск: debounce; первый заход: скелетон.
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/catalog/ProductCard';
import CatalogGridSkeleton from '../components/catalog/CatalogGridSkeleton';
import { PRODUCT_CATEGORIES } from '../constants';
import { api } from '../services/api';
import type { Product, ProductCardStyle } from '../types/index';
import { useAppearance } from '../context/AppearanceContext';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  setCatalogHeroImagePreload,
  clearCatalogHeroImagePreload,
} from '../utils/catalogLcpPreload';

const COLUMNS_GRID: Record<string, string> = {
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const IMAGE_SIZES_BY_COLUMNS: Record<string, string> = {
  '2': '(max-width: 639px) 100vw, 50vw',
  '3': '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw',
  '4': '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw',
};

function columnCount(catalogColumns: string): number {
  const n = parseInt(catalogColumns, 10);
  if (n === 2 || n === 3 || n === 4) return n;
  return 3;
}

function firstRowCount(cols: number, total: number): number {
  return Math.min(total, cols);
}

const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { appearance } = useAppearance();
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'Все',
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || '',
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasCompletedInitialFetch = useRef(false);

  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 280);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'Все') params.set('category', selectedCategory);
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, setSearchParams]);

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      const isFirst = !hasCompletedInitialFetch.current;
      try {
        if (isFirst) {
          setInitialLoading(true);
        } else {
          setIsRefreshing(true);
        }
        setError(null);

        const params: { category?: string; search?: string } = {};
        if (selectedCategory !== 'Все') {
          params.category = selectedCategory;
        }
        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        const data = await api.products.getAll(params);
        if (!cancelled) {
          setProducts(data);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        if (!cancelled) {
          setError('Не удалось загрузить товары. Попробуйте позже.');
        }
      } finally {
        if (!cancelled) {
          setInitialLoading(false);
          setIsRefreshing(false);
          hasCompletedInitialFetch.current = true;
        }
      }
    };

    void fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [selectedCategory, debouncedSearch]);

  useEffect(() => {
    if (products.length > 0) {
      setCatalogHeroImagePreload(products[0].image);
    } else {
      clearCatalogHeroImagePreload();
    }
    return () => {
      clearCatalogHeroImagePreload();
    };
  }, [products]);

  const categories = ['Все', ...PRODUCT_CATEGORIES];

  const colsKey = appearance.catalogColumns ?? '3';
  const cols = useMemo(() => columnCount(colsKey), [colsKey]);
  const imageSizes = IMAGE_SIZES_BY_COLUMNS[colsKey] ?? IMAGE_SIZES_BY_COLUMNS['3'];
  const eagerCount = useMemo(
    () => firstRowCount(cols, products.length),
    [cols, products.length],
  );

  if (error && products.length === 0 && !initialLoading) {
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
              type="button"
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

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 relative">
          {isRefreshing && (
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-0.5 overflow-hidden rounded-t-2xl bg-primary-100"
              aria-hidden
            >
              <div className="h-full w-2/5 animate-pulse bg-primary-500" />
            </div>
          )}
          <div className="mb-6">
            <label htmlFor="catalog-search" className="sr-only">
              Поиск по каталогу
            </label>
            <input
              id="catalog-search"
              type="search"
              enterKeyHint="search"
              autoComplete="off"
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
                type="button"
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

        {error && !initialLoading && products.length > 0 && (
          <div
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        )}

        {initialLoading ? (
          <CatalogGridSkeleton catalogColumns={colsKey} count={Math.max(cols * 3, 8)} />
        ) : products.length > 0 ? (
          <div className={`grid gap-8 ${COLUMNS_GRID[colsKey] ?? COLUMNS_GRID['3']}`}>
            {products.map((product, index) => {
              const inFirstRow = index < eagerCount;
              const lcpHero = index === 0;
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  cardStyle={appearance.productCardStyle as ProductCardStyle}
                  imageLoading={inFirstRow ? 'eager' : 'lazy'}
                  fetchPriority={lcpHero ? 'high' : inFirstRow ? 'auto' : 'low'}
                  imageSizes={imageSizes}
                  deferPaint={!inFirstRow}
                />
              );
            })}
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
              type="button"
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
