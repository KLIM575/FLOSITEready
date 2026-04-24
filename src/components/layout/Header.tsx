import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useAppearance } from '../../context/AppearanceContext';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const { getItemCount } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const { settings } = useSiteSettings();
  const { appearance } = useAppearance();

  const shopName = settings.shopName || 'Flower Shop';
  const shopTagline = settings.shopTagline || 'Магазин цветов';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
            {appearance.logoUrl ? (
              <img
                src={appearance.logoUrl}
                alt={shopName}
                title={shopName}
                className="h-10 w-auto max-w-[120px] sm:max-w-none shrink-0 object-contain group-hover:scale-105 transition-transform"
                width={160}
                height={40}
                sizes="(max-width: 640px) 100px, 160px"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
            ) : (
              <span className="text-4xl shrink-0 group-hover:scale-110 transition-transform">🌸</span>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-lg sm:text-2xl font-bold text-gray-900 font-serif truncate">{shopName}</span>
              <span className="text-xs text-gray-500 -mt-0.5 sm:-mt-1 truncate">{shopTagline}</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              Главная
            </Link>
            <Link 
              to="/catalog" 
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              Каталог
            </Link>
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              О нас
            </Link>
            <Link 
              to="/contacts" 
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              Контакты
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="hidden lg:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Поиск цветов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <svg 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            <Link 
              to="/cart" 
              className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
              aria-label="Корзина покупок"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold" aria-label={`В корзине ${getItemCount()} товаров`}>
                  {getItemCount()}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-4">
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                  >
                    Админ
                  </Link>
                )}
                <Link 
                  to="/profile" 
                  className="p-2 text-gray-700 hover:text-primary-600 transition-colors"
                  title={user.name}
                  aria-label={`Профиль ${user.name}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-gray-700 hover:text-primary-600 transition-colors font-medium"
                >
                  Выход
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="hidden md:block text-gray-700 hover:text-primary-600 transition-colors font-medium"
              >
                Вход
              </button>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors"
              aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={isMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4 px-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Главная
              </Link>
              <Link 
                to="/catalog" 
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Каталог
              </Link>
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                О нас
              </Link>
              <Link 
                to="/contacts" 
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Контакты
              </Link>
              <Link 
                to="/profile" 
                className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Профиль
              </Link>
            </nav>
          </div>
        )}
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {authMode === 'login' ? 'Вход' : 'Регистрация'}
              </h2>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Закрыть диалог"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <AuthForm
              mode={authMode}
              onSuccess={() => setShowAuthModal(false)}
              onSwitchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            />
          </div>
        </div>
      )}
    </header>
  );
};

interface AuthFormProps {
  mode: 'login' | 'register';
  onSuccess: () => void;
  onSwitchMode: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSuccess, onSwitchMode }) => {
  const { login, register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.password, formData.name);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      {mode === 'register' && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Имя
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Email
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Пароль
        </label>
        <input
          type="password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Загрузка...' : (mode === 'login' ? 'Войти' : 'Зарегистрироваться')}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          {mode === 'login' ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
        </button>
      </div>
    </form>
  );
};

export default Header;
