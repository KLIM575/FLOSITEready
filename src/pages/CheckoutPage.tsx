import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { DeliveryZone } from '../types/index';

interface ShippingInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  comment?: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: '',
    phone: '',
    address: '',
    city: '',
    comment: ''
  });
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedDeliveryZoneId, setSelectedDeliveryZoneId] = useState('');
  const [zonesLoadError, setZonesLoadError] = useState<string | null>(null);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const zones = await api.deliveryZones.getAll();
        if (cancelled) return;
        setDeliveryZones(zones);
        setZonesLoadError(null);
        if (zones.length === 1) {
          setSelectedDeliveryZoneId(zones[0].id);
        }
      } catch {
        if (!cancelled) setZonesLoadError('Не удалось загрузить районы доставки');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalPrice = getTotalPrice();
  const hasConfiguredZones = deliveryZones.length > 0;
  const selectedZone = deliveryZones.find((z) => z.id === selectedDeliveryZoneId);
  const deliveryFee = hasConfiguredZones
    ? selectedZone
      ? selectedZone.price
      : 0
    : totalPrice >= 5000
      ? 0
      : 500;
  const finalTotal = totalPrice + deliveryFee;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasConfiguredZones && !selectedDeliveryZoneId) {
      return;
    }
    setStep('payment');
  };

  const handlePaymentComplete = async () => {
    if (hasConfiguredZones && !selectedDeliveryZoneId) {
      setSubmitError('Выберите район доставки');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const orderData = {
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          size: item.size
        })),
        shipping_address: {
          name: shippingInfo.name,
          phone: shippingInfo.phone,
          ...(user?.email ? { email: user.email } : {}),
          city: shippingInfo.city,
          address: shippingInfo.address,
          comment: shippingInfo.comment
        },
        user_id: user?.id,
        ...(hasConfiguredZones && selectedDeliveryZoneId
          ? { delivery_zone_id: selectedDeliveryZoneId }
          : {}),
      };
      
      const order = await api.orders.create(orderData);
      setOrderId(order.id);
      setStep('success');
      clearCart();
      
      redirectTimer.current = setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (err) {
      console.error('Failed to create order:', err);
      setSubmitError('Не удалось создать заказ. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-elegant-50 to-primary-50 py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Корзина пуста</h1>
            <p className="text-gray-600 mb-8">Добавьте товары в корзину, чтобы оформить заказ</p>
            <Link 
              to="/catalog" 
              className="inline-block bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-all"
            >
              Перейти в каталог
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-elegant-50 to-primary-50 py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Заказ оформлен!</h1>
            {orderId && (
              <p className="text-sm text-gray-500 mb-2">Номер заказа: {orderId}</p>
            )}
            <p className="text-xl text-gray-600 mb-8">Спасибо за покупку</p>
            <div className="bg-primary-50 rounded-lg p-6 mb-8">
              {selectedZone && (
                <p className="text-gray-700 mb-2">
                  <strong>Район доставки:</strong> {selectedZone.name}
                </p>
              )}
              <p className="text-gray-700 mb-2">
                <strong>Адрес доставки:</strong> {shippingInfo.address}, {shippingInfo.city}
              </p>
              <p className="text-gray-700">
                <strong>Телефон:</strong> {shippingInfo.phone}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Перенаправление на главную страницу через несколько секунд...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-elegant-50 to-primary-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Оформление заказа
        </h1>

        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === 'shipping' ? 'bg-primary-600 text-white' : 'bg-white text-primary-600 border-2 border-primary-600'
            }`}>
              1
            </div>
            <div className="text-sm font-medium ml-2 mr-8">Доставка</div>
            
            <div className={`w-20 h-1 ${step === 'payment' ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
            
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ml-8 ${
              step === 'payment' ? 'bg-primary-600 text-white' : 'bg-gray-300 text-white'
            }`}>
              2
            </div>
            <div className="text-sm font-medium ml-2">Оплата</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Информация о доставке
                </h2>
                <form onSubmit={handleShippingSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Имя получателя *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.name}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Иван Иванов"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Телефон *
                      </label>
                      <input
                        type="tel"
                        required
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>
                  </div>

                  {zonesLoadError && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-900 text-sm">
                      {zonesLoadError}
                    </div>
                  )}

                  {hasConfiguredZones && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Район доставки *
                      </label>
                      <select
                        required
                        value={selectedDeliveryZoneId}
                        onChange={(e) => setSelectedDeliveryZoneId(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                      >
                        <option value="">Выберите район</option>
                        {deliveryZones.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.name} —{' '}
                            {z.price === 0
                              ? 'бесплатно'
                              : `${z.price.toLocaleString('ru-RU')} ₽`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Город *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Москва"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Адрес доставки *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="ул. Примерная, д. 1, кв. 1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Комментарий к заказу
                    </label>
                    <textarea
                      value={shippingInfo.comment}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, comment: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      placeholder="Укажите удобное время доставки, пожелания к букету..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={hasConfiguredZones && !selectedDeliveryZoneId}
                    className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Перейти к оплате
                  </button>
                  {hasConfiguredZones && !selectedDeliveryZoneId && (
                    <p className="text-sm text-center text-amber-700">
                      Выберите район доставки, чтобы продолжить
                    </p>
                  )}
                </form>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <button
                  onClick={() => setStep('shipping')}
                  className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors mb-6"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Назад к информации о доставке
                </button>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Оплата заказа
                </h2>

                <div className="space-y-6">
                  <div className="bg-primary-50 rounded-lg p-6 border-2 border-primary-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                      Оплата по QR-коду
                    </h3>
                    
                    <div className="bg-white rounded-lg p-6 mb-4">
                      <div className="flex justify-center mb-4">
                        <div className="bg-white p-4 rounded-lg border-4 border-gray-200">
                          <svg 
                            className="w-64 h-64"
                            viewBox="0 0 256 256"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect width="256" height="256" fill="white"/>
                            <rect x="20" y="20" width="40" height="40" fill="black"/>
                            <rect x="68" y="20" width="8" height="8" fill="black"/>
                            <rect x="84" y="20" width="8" height="8" fill="black"/>
                            <rect x="100" y="20" width="8" height="8" fill="black"/>
                            <rect x="196" y="20" width="40" height="40" fill="black"/>
                            <rect x="20" y="68" width="8" height="8" fill="black"/>
                            <rect x="52" y="68" width="8" height="8" fill="black"/>
                            <rect x="84" y="68" width="24" height="8" fill="black"/>
                            <rect x="196" y="68" width="8" height="8" fill="black"/>
                            <rect x="228" y="68" width="8" height="8" fill="black"/>
                            <rect x="20" y="84" width="8" height="8" fill="black"/>
                            <rect x="52" y="84" width="8" height="8" fill="black"/>
                            <rect x="68" y="84" width="24" height="8" fill="black"/>
                            <rect x="196" y="84" width="8" height="8" fill="black"/>
                            <rect x="228" y="84" width="8" height="8" fill="black"/>
                            <rect x="20" y="100" width="8" height="8" fill="black"/>
                            <rect x="52" y="100" width="8" height="8" fill="black"/>
                            <rect x="84" y="100" width="8" height="8" fill="black"/>
                            <rect x="196" y="100" width="8" height="8" fill="black"/>
                            <rect x="228" y="100" width="8" height="8" fill="black"/>
                            <rect x="20" y="196" width="40" height="40" fill="black"/>
                            <rect x="68" y="196" width="24" height="8" fill="black"/>
                            <rect x="196" y="196" width="40" height="40" fill="black"/>
                            <rect x="28" y="28" width="24" height="24" fill="white"/>
                            <rect x="204" y="28" width="24" height="24" fill="white"/>
                            <rect x="28" y="204" width="24" height="24" fill="white"/>
                            <rect x="116" y="116" width="24" height="24" fill="black"/>
                            <rect x="100" y="132" width="56" height="8" fill="black"/>
                            <rect x="132" y="100" width="8" height="56" fill="black"/>
                          </svg>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 mb-2">
                          {finalTotal.toLocaleString('ru-RU')} ₽
                        </p>
                        <p className="text-sm text-gray-600">
                          Отсканируйте QR-код для оплаты
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm text-gray-700">
                      <p className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Откройте приложение банка
                      </p>
                      <p className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Наведите камеру на QR-код
                      </p>
                      <p className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Подтвердите оплату в приложении
                      </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-primary-200">
                      <p className="text-center text-sm text-gray-600 mb-4">
                        Поддерживаемые банки и платежные системы:
                      </p>
                      <div className="flex justify-center gap-4 flex-wrap">
                        <span className="px-3 py-1 bg-white rounded-lg text-sm font-medium text-gray-700">
                          Сбербанк
                        </span>
                        <span className="px-3 py-1 bg-white rounded-lg text-sm font-medium text-gray-700">
                          Тинькофф
                        </span>
                        <span className="px-3 py-1 bg-white rounded-lg text-sm font-medium text-gray-700">
                          Альфа-Банк
                        </span>
                        <span className="px-3 py-1 bg-white rounded-lg text-sm font-medium text-gray-700">
                          СБП
                        </span>
                      </div>
                    </div>
                  </div>

                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handlePaymentComplete}
                    disabled={isSubmitting}
                    className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Обработка заказа...' : 'Оплата прошла успешно'}
                  </button>

                  <p className="text-xs text-center text-gray-500">
                    Демо-режим: нажмите кнопку выше для имитации успешной оплаты
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Ваш заказ
              </h3>
              
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {items.map((item, index) => (
                  <div key={`${item.product.id}-${item.size}-${index}`} className="flex gap-4">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {item.product.name}
                      </h4>
                      {item.size && (
                        <p className="text-xs text-gray-600">Размер: {item.size}</p>
                      )}
                      <p className="text-xs text-gray-600">
                        {item.quantity} шт. × {
                          item.size && item.product.sizes
                            ? item.product.sizes.find(s => s.size === item.size)?.price.toLocaleString('ru-RU')
                            : item.product.price.toLocaleString('ru-RU')
                        } ₽
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Товары:</span>
                  <span className="font-semibold">{totalPrice.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Доставка:</span>
                  <span className="font-semibold">
                    {hasConfiguredZones && !selectedZone ? (
                      <span className="text-gray-500">—</span>
                    ) : deliveryFee === 0 ? (
                      <span className="text-green-600">Бесплатно</span>
                    ) : (
                      `${deliveryFee.toLocaleString('ru-RU')} ₽`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Итого:</span>
                  <span>{finalTotal.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>

              {!hasConfiguredZones && totalPrice < 5000 && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  Добавьте товаров на {(5000 - totalPrice).toLocaleString('ru-RU')} ₽ для бесплатной доставки
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
