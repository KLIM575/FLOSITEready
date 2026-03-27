import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { Product } from '../../types/index';
import ProductCard from '../catalog/ProductCard';

const FeaturedProducts: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.products.getAll()
      .then((products) => setFeaturedProducts(products.slice(0, 4)))
      .catch(() => {});
  }, []);

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-elegant-50 to-primary-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Популярные букеты</h2>
          <p className="text-xl text-gray-600">Наши бестселлеры этого месяца</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link 
            to="/catalog" 
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition-all"
          >
            Посмотреть весь каталог
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
