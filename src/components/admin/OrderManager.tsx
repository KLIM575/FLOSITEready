import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { Order } from '../../types/index';

const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.orders.getAll();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Не удалось загрузить заказы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.orders.updateStatus(orderId, newStatus);
      setOrders(orders.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus as any }
          : order
      ));
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Не удалось обновить статус заказа');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Ожидает',
      processing: 'В обработке',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменен',
    };
    return labels[status] || status;
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(prev => (prev === orderId ? null : orderId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Управление заказами</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID заказа
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Клиент
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Букеты
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Сумма
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <React.Fragment key={order.id}>
                <tr
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => toggleExpand(order.id)}
                >
                  <td className="px-4 py-4 text-gray-400">
                    <svg
                      className={`w-4 h-4 transition-transform ${expandedOrder === order.id ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {order.id.substring(0, 8)}...
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.shippingAddress?.name || 'Гость'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.shippingAddress?.phone}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.shippingAddress?.email}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {item.product_image && (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-8 h-8 rounded object-cover flex-shrink-0"
                            />
                          )}
                          <span className="text-sm text-gray-800">
                            {item.product_name || item.product_id}
                            {item.size && (
                              <span className="ml-1 text-xs text-gray-500">({item.size})</span>
                            )}
                            <span className="ml-1 text-xs text-gray-500">× {item.quantity}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {order.totalAmount.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={e => e.stopPropagation()}>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="pending">Ожидает</option>
                      <option value="processing">В обработке</option>
                      <option value="shipped">Отправлен</option>
                      <option value="delivered">Доставлен</option>
                      <option value="cancelled">Отменен</option>
                    </select>
                  </td>
                </tr>

                {expandedOrder === order.id && (
                  <tr>
                    <td colSpan={8} className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Состав заказа</h4>
                          <div className="space-y-3">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                                {item.product_image && (
                                  <img
                                    src={item.product_image}
                                    alt={item.product_name}
                                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {item.product_name || item.product_id}
                                  </p>
                                  {item.size && (
                                    <p className="text-xs text-gray-500">Размер: {item.size}</p>
                                  )}
                                  <p className="text-xs text-gray-500">
                                    {item.quantity} шт. × {item.price.toLocaleString('ru-RU')} ₽
                                  </p>
                                </div>
                                <div className="text-sm font-semibold text-gray-900 flex-shrink-0">
                                  {(item.quantity * item.price).toLocaleString('ru-RU')} ₽
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Доставка</h4>
                          <div className="bg-white rounded-lg p-4 shadow-sm space-y-2 text-sm text-gray-700">
                            {(order.deliveryZoneId || order.shippingAddress?.delivery_zone_name) && (
                              <div>
                                <span className="font-medium">Район:</span>{' '}
                                {order.shippingAddress?.delivery_zone_name ?? '—'}
                                {order.deliveryFee != null && order.deliveryFee > 0 && (
                                  <span className="text-gray-600">
                                    {' '}
                                    (доставка: {order.deliveryFee.toLocaleString('ru-RU')} ₽)
                                  </span>
                                )}
                                {order.deliveryFee === 0 && (
                                  <span className="text-green-600"> — бесплатно</span>
                                )}
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Получатель:</span>{' '}
                              {order.shippingAddress?.name}
                            </div>
                            <div>
                              <span className="font-medium">Телефон:</span>{' '}
                              {order.shippingAddress?.phone}
                            </div>
                            <div>
                              <span className="font-medium">Email:</span>{' '}
                              {order.shippingAddress?.email}
                            </div>
                            <div>
                              <span className="font-medium">Адрес:</span>{' '}
                              {order.shippingAddress?.address}, {order.shippingAddress?.city}
                              {order.shippingAddress?.postal_code && `, ${order.shippingAddress.postal_code}`}
                            </div>
                            {order.shippingAddress?.comment && (
                              <div>
                                <span className="font-medium">Комментарий:</span>{' '}
                                {order.shippingAddress.comment}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Заказов пока нет</p>
        </div>
      )}
    </div>
  );
};

export default OrderManager;
