import React from 'react';
import { Link } from 'react-router-dom';

const CallToAction: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Готовы сделать заказ?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Свяжитесь с нами по телефону или оформите заказ онлайн
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a 
            href="tel:+79001234567" 
            className="text-2xl font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            +7 (900) 123-45-67
          </a>
          <span className="hidden sm:block text-gray-400">или</span>
          <Link 
            to="/catalog" 
            className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-lg"
          >
            Перейти в каталог
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
