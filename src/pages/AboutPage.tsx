import React from 'react';
import SEO from '../components/seo/SEO';

const AboutPage: React.FC = () => {
  return (
    <>
      <SEO
        title="О нас"
        description="Узнайте больше о нашем цветочном магазине. Мы создаём неповторимые букеты и композиции из свежих цветов с 2020 года. Более 500 довольных клиентов и 1000+ созданных букетов."
        keywords="о нас, цветочный магазин, флористика, история компании, доставка цветов"
        canonicalPath="/about"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'О нас',
          description: 'Информация о цветочном магазине',
          mainEntity: {
            '@type': 'Organization',
            name: 'Flower Shop',
            foundingDate: '2020',
            description: 'Цветочный магазин, создающий неповторимые букеты и композиции для самых важных моментов вашей жизни.',
          },
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-elegant-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-8 text-center">
            О нас
          </h1>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Добро пожаловать в <span className="font-semibold text-primary-600">Flower Shop</span> - 
            ваш надежный партнер в мире цветов с 2020 года. Мы создаём неповторимые 
            букеты и композиции для самых важных моментов вашей жизни.
          </p>
          
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Наша команда профессиональных флористов работает только со свежими цветами 
            от проверенных поставщиков. Мы тщательно отбираем каждый цветок, чтобы 
            ваш букет радовал вас как можно дольше.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600">Довольных клиентов</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">1000+</div>
              <div className="text-gray-600">Букетов создано</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">6</div>
              <div className="text-gray-600">Лет на рынке</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default AboutPage;
