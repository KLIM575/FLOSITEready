import React from 'react';
import { Link } from 'react-router-dom';

const CartPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Корзина</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Ваша корзина пуста
          </h2>
          <p className="text-gray-600 mb-6">
            Добавьте товары из каталога, чтобы оформить заказ
          </p>
          <Link 
            to="/catalog" 
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Перейти в каталог
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
