import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { DeliveryZone } from '../../types/index';

const DeliveryManager: React.FC = () => {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.deliveryZones.getAll();
      setZones(data);
      setError(null);
    } catch {
      setError('Не удалось загрузить районы доставки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    const price = parseFloat(newPrice.replace(',', '.'));
    if (!name || Number.isNaN(price) || price < 0) return;
    setSaving(true);
    setError(null);
    try {
      await api.deliveryZones.create({ name, price });
      setNewName('');
      setNewPrice('');
      await load();
    } catch {
      setError('Не удалось добавить район');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (z: DeliveryZone) => {
    setEditingId(z.id);
    setEditName(z.name);
    setEditPrice(String(z.price));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditPrice('');
  };

  const saveEdit = async (id: string) => {
    const name = editName.trim();
    const price = parseFloat(editPrice.replace(',', '.'));
    if (!name || Number.isNaN(price) || price < 0) return;
    setSaving(true);
    setError(null);
    try {
      await api.deliveryZones.update(id, { name, price });
      cancelEdit();
      await load();
    } catch {
      setError('Не удалось сохранить изменения');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Удалить этот район доставки?')) return;
    setError(null);
    try {
      await api.deliveryZones.delete(id);
      if (editingId === id) cancelEdit();
      await load();
    } catch {
      setError('Не удалось удалить район');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Доставка</h2>
      <p className="text-gray-600 mb-6">
        Районы и стоимость доставки отображаются на странице оформления заказа. Пока список пуст, доставка в заказе не требует выбора района.
      </p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">{error}</div>
      )}

      <form onSubmit={handleAdd} className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Новый район</h3>
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Название района</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Например, Центр"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Стоимость, ₽</label>
            <input
              type="number"
              min={0}
              step={1}
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="500"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !newName.trim() || newPrice === ''}
            className="bg-primary-600 text-white py-2.5 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Добавить
          </button>
        </div>
      </form>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Район
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Стоимость
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {zones.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500 text-sm">
                  Районы не добавлены. Добавьте хотя бы один, чтобы на checkout появился выбор района.
                </td>
              </tr>
            ) : (
              zones.map((z) => (
                <tr key={z.id}>
                  <td className="px-4 py-3">
                    {editingId === z.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900">{z.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === z.id ? (
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    ) : (
                      <span className="text-sm text-gray-800">{z.price.toLocaleString('ru-RU')} ₽</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {editingId === z.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(z.id)}
                          disabled={saving}
                          className="text-sm font-semibold text-primary-600 hover:text-primary-800 disabled:opacity-50"
                        >
                          Сохранить
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          Отмена
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => startEdit(z)}
                          className="text-sm font-semibold text-primary-600 hover:text-primary-800"
                        >
                          Изменить
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(z.id)}
                          className="text-sm font-semibold text-red-600 hover:text-red-800"
                        >
                          Удалить
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveryManager;
