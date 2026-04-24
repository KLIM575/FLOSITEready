import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'cookie_consent';

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      role="dialog"
      aria-live="polite"
      aria-label="Уведомление о файлах cookie"
    >
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-5 md:p-6">
          <div className="flex-shrink-0 hidden md:flex items-center justify-center w-12 h-12 bg-primary-50 rounded-full">
            <svg
              className="w-6 h-6 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 14a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm1-5a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0z"
              />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              Мы используем файлы cookie для корректной работы сайта, анализа трафика и улучшения
              пользовательского опыта. Нажимая «Принять», вы соглашаетесь с нашей{' '}
              <Link
                to="/privacy"
                className="text-primary-600 hover:text-primary-700 underline font-medium"
                onClick={() => setVisible(false)}
              >
                Политикой конфиденциальности
              </Link>
              .
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 w-full md:w-auto">
            <button
              onClick={decline}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Отклонить
            </button>
            <button
              onClick={accept}
              className="px-5 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors whitespace-nowrap"
            >
              Принять все
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
