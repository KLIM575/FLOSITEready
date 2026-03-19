import React from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-elegant-50 py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Цветы, которые
              <span className="text-primary-600 block">дарят радость</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Создаём неповторимые букеты для ваших особенных моментов. 
              Свежие цветы, быстрая доставка, индивидуальный подход.
            </p>
            <div className="flex gap-4">
              <Link 
                to="/catalog" 
                className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Смотреть каталог
              </Link>
              <Link 
                to="/about" 
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition-all"
              >
                Узнать больше
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-elegant-400 rounded-full blur-3xl opacity-20"></div>
            <img 
              src="/images/hero-flowers.jpg" 
              alt="Красивый букет цветов" 
              className="relative z-10 w-full h-auto rounded-2xl shadow-2xl"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=800&fit=crop';
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
