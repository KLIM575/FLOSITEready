import React from 'react';
import { Link } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

const FeaturedProducts: React.FC = () => {
  const featuredProducts: Product[] = [
    {
      id: 1,
      name: 'Букет роз "Романтика"',
      price: 4500,
      image: '/images/products/roses.jpg',
      category: 'Букеты'
    },
    {
      id: 2,
      name: 'Композиция "Весна"',
      price: 3200,
      image: '/images/products/spring.jpg',
      category: 'Композиции'
    },
    {
      id: 3,
      name: 'Букет тюльпанов',
      price: 2800,
      image: '/images/products/tulips.jpg',
      category: 'Букеты'
    },
    {
      id: 4,
      name: 'Орхидея в горшке',
      price: 5500,
      image: '/images/products/orchid.jpg',
      category: 'Растения'
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-elegant-50 to-primary-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Популярные букеты</h2>
          <p className="text-xl text-gray-600">Наши бестселлеры этого месяца</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <Link 
              key={product.id} 
              to={`/product/${product.id}`}
              className="group"
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400&h=400&fit=crop';
                    }}
                  />
                </div>
                <div className="p-6">
                  <span className="text-sm text-primary-600 font-medium">
                    {product.category}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 mt-2 mb-3">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {product.price.toLocaleString('ru-RU')} ₽
                    </span>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                      В корзину
                    </button>
                  </div>
                </div>
              </div>
            </Link>
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
