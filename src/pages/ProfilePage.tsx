import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Order } from '../types/index';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, logout, login, register } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setOrdersLoading(true);
      api.orders.getByUserId(user.id)
        .then(setOrders)
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false));
    }
  }, [user?.id]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);
    try {
      if (authMode === 'login') {
        await login(authForm.email, authForm.password);
      } else {
        await register(authForm.email, authForm.password, authForm.name);
      }
      setShowAuthModal(false);
      setAuthForm({ email: '', password: '', name: '' });
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusLabels: Record<string, string> = {
    pending: 'Ожидает',
    processing: 'В обработке',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Личный кабинет</h1>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Войдите в систему
            </h2>
            <p className="text-gray-600 mb-6">
              Авторизуйтесь, чтобы получить доступ к личному кабинету
            </p>
            <button
              onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Войти
            </button>
            <p className="mt-4 text-sm text-gray-500">
              Нет аккаунта?{' '}
              <button
                onClick={() => { setShowAuthModal(true); setAuthMode('register'); }}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Зарегистрируйтесь
              </button>
            </p>
          </div>

          {showAuthModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {authMode === 'login' ? 'Вход' : 'Регистрация'}
                  </h2>
                  <button onClick={() => setShowAuthModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">{authError}</div>
                  )}
                  {authMode === 'register' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Имя</label>
                      <input type="text" required value={authForm.name}
                        onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                    <input type="email" required value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Пароль</label>
                    <input type="password" required value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <button type="submit" disabled={isSubmitting}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Загрузка...' : (authMode === 'login' ? 'Войти' : 'Зарегистрироваться')}
                  </button>
                  <div className="text-center">
                    <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      {authMode === 'login' ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Личный кабинет</h1>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
                👤
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-gray-600 hover:text-red-600 transition-colors font-medium"
            >
              Выйти
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Мои заказы</h2>
          
          {ordersLoading ? (
            <div className="text-center py-8 text-gray-500">Загрузка заказов...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">У вас пока нет заказов</p>
              <a href="/catalog" className="text-primary-600 hover:text-primary-700 font-medium">
                Перейти в каталог
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-sm text-gray-500">Заказ #{order.id.slice(0, 8)}</span>
                      <span className="text-sm text-gray-400 ml-4">
                        {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {order.items.length} {order.items.length === 1 ? 'товар' : 'товаров'}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {order.totalAmount.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
