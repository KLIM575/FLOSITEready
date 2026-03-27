import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import ProductManager from '../components/admin/ProductManager';
import OrderManager from '../components/admin/OrderManager';
import SiteSettingsManager from '../components/admin/SiteSettings';

const AdminPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('products');

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-elegant-50 to-primary-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Панель администратора</h1>
          <p className="text-gray-600">Управление товарами, заказами и настройками сайта</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-8 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'products'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Товары
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-8 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'orders'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Заказы
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-8 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Настройки сайта
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'products' && <ProductManager />}
            {activeTab === 'orders' && <OrderManager />}
            {activeTab === 'settings' && <SiteSettingsManager />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
