import { useState, useEffect } from 'react';
import type { Order } from '../types/index.js';
import { api } from '../services/api';

export const useOrders = (userId?: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = userId 
          ? await api.orders.getByUserId(userId)
          : await api.orders.getAll();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  return { orders, loading, error };
};
