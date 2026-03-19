import { Product, Order, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
  products: {
    getAll: async (): Promise<Product[]> => {
      const response = await fetch(`${API_BASE_URL}/products`);
      return response.json();
    },
    getById: async (id: string): Promise<Product> => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      return response.json();
    },
    create: async (product: Omit<Product, 'id'>): Promise<Product> => {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      return response.json();
    },
    update: async (id: string, product: Partial<Product>): Promise<Product> => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      return response.json();
    },
    delete: async (id: string): Promise<void> => {
      await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
    },
  },
  orders: {
    create: async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      return response.json();
    },
    getByUserId: async (userId: string): Promise<Order[]> => {
      const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`);
      return response.json();
    },
    getAll: async (): Promise<Order[]> => {
      const response = await fetch(`${API_BASE_URL}/orders`);
      return response.json();
    },
  },
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return response.json();
    },
    register: async (email: string, password: string, name: string): Promise<User> => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      return response.json();
    },
  },
};
