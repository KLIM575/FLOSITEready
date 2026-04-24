import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();

  const totalPrice = getTotalPrice();
  const deliveryFee = totalPrice >= 5000 ? 0 : 500;
  const finalTotal = totalPrice + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-elegant-50 to-primary-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Корзина</h1>
          
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Ваша корзина пуста
            </h2>
            <p className="text-gray-600 mb-8">
              Добавьте товары из каталога, чтобы оформить заказ
            </p>
            <Link 
              to="/catalog" 
              className="inline-block bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl"
            >
              Перейти в каталог
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-elegant-50 to-primary-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Корзина</h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Очистить корзину
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => {
              const itemPrice = item.size && item.product.sizes
                ? item.product.sizes.find(s => s.size === item.size)?.price || item.product.price
                : item.product.price;

              return (
                <div key={`${item.product.id}-${item.size}-${index}`} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex gap-6">
                    <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name}
                        title={item.product.name}
                        className="w-32 h-32 object-cover rounded-lg hover:opacity-80 transition-opacity"
                      />
                    </Link>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Link 
                            to={`/product/${item.product.id}`}
                            className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-sm text-gray-600 mt-1">{item.product.category}</p>
                          {item.size && (
                            <span className="inline-block mt-2 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                              Размер: {item.size}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.size)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border-2 border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1), item.size)}
                            className="px-3 py-1 text-gray-700 hover:bg-gray-100 transition-colors font-bold"
                          >
                            −
                          </button>
                          <span className="px-4 py-1 border-x-2 border-gray-300 font-semibold min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size)}
                            className="px-3 py-1 text-gray-700 hover:bg-gray-100 transition-colors font-bold"
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {(itemPrice * item.quantity).toLocaleString('ru-RU')} ₽
                          </p>
                          <p className="text-sm text-gray-600">
                            {itemPrice.toLocaleString('ru-RU')} ₽ за шт.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-24">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Итого
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Товары ({items.reduce((sum, item) => sum + item.quantity, 0)} шт.):</span>
                  <span className="font-semibold">{totalPrice.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Доставка:</span>
                  <span className="font-semibold">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">Бесплатно</span>
                    ) : (
                      `${deliveryFee} ₽`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-gray-900 pt-4 border-t border-gray-200">
                  <span>К оплате:</span>
                  <span>{finalTotal.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>

              {totalPrice < 5000 && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <p className="font-semibold mb-1">Бесплатная доставка от 5000 ₽</p>
                  <p>Добавьте товаров на {(5000 - totalPrice).toLocaleString('ru-RU')} ₽</p>
                </div>
              )}

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mb-3"
              >
                Оформить заказ
              </button>

              <Link
                to="/catalog"
                className="block w-full text-center bg-white text-primary-600 py-4 rounded-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition-all"
              >
                Продолжить покупки
              </Link>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Преимущества:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Доставка в течение 2-4 часов
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Гарантия свежести цветов
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Фото букета перед доставкой
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
