import React from 'react';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const Features: React.FC = () => {
  const features: Feature[] = [
    {
      icon: '🚚',
      title: 'Быстрая доставка',
      description: 'Доставим ваш заказ в течение 2-3 часов по городу'
    },
    {
      icon: '🌸',
      title: 'Свежие цветы',
      description: 'Только свежие цветы от проверенных поставщиков'
    },
    {
      icon: '💐',
      title: 'Индивидуальный подход',
      description: 'Создадим букет по вашим пожеланиям'
    },
    {
      icon: '🎁',
      title: 'Подарочная упаковка',
      description: 'Красивая упаковка в подарок к каждому заказу'
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Почему выбирают нас</h2>
          <p className="text-xl text-gray-600">Мы заботимся о каждой детали вашего заказа</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="text-center p-6 rounded-xl hover:bg-elegant-50 transition-all group"
            >
              <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
