import type { Product, Order, User, CartItem, SiteSettings } from '../types/index';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(response.status, error.detail || error.message || 'Request failed');
  }
  
  if (response.status === 204) {
    return null as T;
  }
  
  return response.json();
}

function transformProduct(data: any): Product {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price,
    sizes: data.sizes,
    image: data.image,
    images: data.images,
    category: data.category,
    inStock: data.in_stock,
  };
}

function transformOrder(data: any): Order {
  return {
    id: data.id,
    userId: data.user_id,
    items: data.items,
    totalAmount: data.total_amount,
    status: data.status,
    shippingAddress: data.shipping_address,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export const api = {
  products: {
    getAll: async (params?: { category?: string; search?: string }): Promise<Product[]> => {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.search) queryParams.append('search', params.search);
      
      const url = `${API_BASE_URL}/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url);
      const data = await handleResponse<any[]>(response);
      return data.map(transformProduct);
    },
    
    getById: async (id: string): Promise<Product> => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      const data = await handleResponse<any>(response);
      return transformProduct(data);
    },
    
    create: async (product: Omit<Product, 'id'>): Promise<Product> => {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const data = await handleResponse<any>(response);
      return transformProduct(data);
    },
    
    update: async (id: string, product: Partial<Product>): Promise<Product> => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const data = await handleResponse<any>(response);
      return transformProduct(data);
    },
    
    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, { 
        method: 'DELETE' 
      });
      return handleResponse<void>(response);
    },
    
    uploadImage: async (productId: string, file: File): Promise<{ filename: string; url: string }> => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/products/${productId}/images`, {
        method: 'POST',
        body: formData,
      });
      return handleResponse<{ filename: string; url: string }>(response);
    },
  },
  
  orders: {
    create: async (orderData: {
      items: Array<{ product_id: string; quantity: number; size?: string }>;
      shipping_address: {
        name: string;
        phone: string;
        email: string;
        city: string;
        postal_code?: string;
        address: string;
        comment?: string;
      };
      user_id?: string;
    }): Promise<Order> => {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const data = await handleResponse<any>(response);
      return transformOrder(data);
    },
    
    getByUserId: async (userId: string): Promise<Order[]> => {
      const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`);
      const data = await handleResponse<any[]>(response);
      return data.map(transformOrder);
    },
    
    getAll: async (): Promise<Order[]> => {
      const response = await fetch(`${API_BASE_URL}/orders`);
      const data = await handleResponse<any[]>(response);
      return data.map(transformOrder);
    },
    
    updateStatus: async (orderId: string, status: string): Promise<Order> => {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await handleResponse<any>(response);
      return transformOrder(data);
    },
  },
  
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse<User>(response);
    },
    
    register: async (email: string, password: string, name: string): Promise<User> => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      return handleResponse<User>(response);
    },
  },
  
  search: {
    products: async (query: string): Promise<Product[]> => {
      const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
      return handleResponse<Product[]>(response);
    },
  },

  settings: {
    get: async (): Promise<SiteSettings> => {
      const response = await fetch(`${API_BASE_URL}/settings`);
      return handleResponse<SiteSettings>(response);
    },
    update: async (data: SiteSettings): Promise<SiteSettings> => {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<SiteSettings>(response);
    },
  },
};

export { ApiError };
