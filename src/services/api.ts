import type {
  Product,
  Order,
  User,
  SiteSettings,
  AppearanceSettings,
  DeliveryZone,
  SalesStats,
  VisitsStats,
  OrderShippingAddress,
  FeedSettings,
} from '../types/index';

/** Тело ответа API для товара (snake_case с бэкенда). */
interface ProductApi {
  id: string;
  slug?: string;
  name: string;
  description: string;
  price: number;
  sizes?: Product['sizes'];
  image: string;
  images?: string[];
  category: string;
  in_stock: boolean;
}

interface OrderItemApi {
  id: number;
  order_id: string;
  product_id: string;
  product_name?: string;
  product_image?: string;
  quantity: number;
  size?: string | null;
  price: number;
}

interface OrderApi {
  id: string;
  user_id?: string | null;
  items: OrderItemApi[];
  total_amount: number;
  delivery_fee?: number | null;
  delivery_zone_id?: string | null;
  status: Order['status'];
  shipping_address?: OrderShippingAddress | null;
  created_at: string;
  updated_at: string;
}

interface DeliveryZoneApi {
  id: string;
  name: string;
  price: number;
  sort_order?: number;
}

/**
 * Базовый URL API.
 * - Без VITE_API_URL: относительный `/api` — тот же origin (Vite proxy в dev/preview, nginx/хостинг в production).
 * - Не используйте 127.0.0.1 по умолчанию в production: у посетителя сайта это его компьютер, не сервер.
 */
const envApi = import.meta.env.VITE_API_URL as string | undefined;
const API_BASE_URL =
  envApi && envApi.length > 0 ? envApi.replace(/\/$/, '') : '/api';

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
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

function transformProduct(data: ProductApi): Product {
  return {
    id: data.id,
    slug: data.slug,
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

function transformOrder(data: OrderApi): Order {
  return {
    id: data.id,
    userId: data.user_id ?? undefined,
    items: data.items as Order['items'],
    totalAmount: data.total_amount,
    deliveryFee: data.delivery_fee != null ? Number(data.delivery_fee) : undefined,
    deliveryZoneId: data.delivery_zone_id != null ? data.delivery_zone_id : undefined,
    status: data.status,
    shippingAddress: data.shipping_address,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

function transformDeliveryZone(data: DeliveryZoneApi): DeliveryZone {
  return {
    id: data.id,
    name: data.name,
    price: data.price,
    sortOrder: data.sort_order ?? 0,
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
      const data = await handleResponse<ProductApi[]>(response);
      return data.map(transformProduct);
    },
    
    getById: async (id: string): Promise<Product> => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      const data = await handleResponse<ProductApi>(response);
      return transformProduct(data);
    },
    
    create: async (product: Omit<Product, 'id'>): Promise<Product> => {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const data = await handleResponse<ProductApi>(response);
      return transformProduct(data);
    },
    
    update: async (id: string, product: Partial<Product>): Promise<Product> => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const data = await handleResponse<ProductApi>(response);
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
        email?: string;
        city: string;
        postal_code?: string;
        address: string;
        comment?: string;
      };
      user_id?: string;
      delivery_zone_id?: string;
    }): Promise<Order> => {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const data = await handleResponse<OrderApi>(response);
      return transformOrder(data);
    },
    
    getByUserId: async (userId: string): Promise<Order[]> => {
      const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`);
      const data = await handleResponse<OrderApi[]>(response);
      return data.map(transformOrder);
    },
    
    getAll: async (): Promise<Order[]> => {
      const response = await fetch(`${API_BASE_URL}/orders`);
      const data = await handleResponse<OrderApi[]>(response);
      return data.map(transformOrder);
    },
    
    updateStatus: async (orderId: string, status: string): Promise<Order> => {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await handleResponse<OrderApi>(response);
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

  appearance: {
    get: async (): Promise<AppearanceSettings> => {
      const response = await fetch(`${API_BASE_URL}/appearance`);
      return handleResponse<AppearanceSettings>(response);
    },
    update: async (data: AppearanceSettings): Promise<AppearanceSettings> => {
      const response = await fetch(`${API_BASE_URL}/appearance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<AppearanceSettings>(response);
    },
    uploadAsset: async (
      file: File,
      assetType: 'logo' | 'favicon' | 'banner'
    ): Promise<{ url: string }> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('asset_type', assetType);
      const response = await fetch(`${API_BASE_URL}/appearance/upload-asset`, {
        method: 'POST',
        body: formData,
      });
      return handleResponse<{ url: string }>(response);
    },
  },

  deliveryZones: {
    getAll: async (): Promise<DeliveryZone[]> => {
      const response = await fetch(`${API_BASE_URL}/delivery-zones`);
      const data = await handleResponse<DeliveryZoneApi[]>(response);
      return data.map(transformDeliveryZone);
    },

    create: async (payload: { name: string; price: number }): Promise<DeliveryZone> => {
      const response = await fetch(`${API_BASE_URL}/delivery-zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: payload.name, price: payload.price }),
      });
      const data = await handleResponse<DeliveryZoneApi>(response);
      return transformDeliveryZone(data);
    },

    update: async (
      id: string,
      payload: { name?: string; price?: number; sort_order?: number }
    ): Promise<DeliveryZone> => {
      const response = await fetch(`${API_BASE_URL}/delivery-zones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await handleResponse<DeliveryZoneApi>(response);
      return transformDeliveryZone(data);
    },

    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/delivery-zones/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new ApiError(response.status, error.detail || error.message || 'Request failed');
      }
    },
  },

  serverTime: {
    getYear: async (): Promise<number> => {
      const response = await fetch(`${API_BASE_URL}/server-time`);
      const data = await handleResponse<{ year: number }>(response);
      return data.year;
    },
  },

  feed: {
    getSettings: async (): Promise<FeedSettings> => {
      const response = await fetch(`${API_BASE_URL}/feed/settings`);
      return handleResponse<FeedSettings>(response);
    },

    updateSettings: async (payload: FeedSettings): Promise<FeedSettings> => {
      const response = await fetch(`${API_BASE_URL}/feed/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return handleResponse<FeedSettings>(response);
    },

    getYml: async (): Promise<string> => {
      const response = await fetch(`${API_BASE_URL}/feed/yml`);
      if (!response.ok) {
        throw new ApiError(response.status, 'Не удалось получить фид');
      }
      return response.text();
    },
  },

  stats: {
    recordPageView: async (path: string): Promise<void> => {
      try {
        const response = await fetch(`${API_BASE_URL}/stats/pageview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path }),
        });
        if (!response.ok) {
          await response.json().catch(() => null);
        }
      } catch {
        /* ignore analytics failures */
      }
    },

    getSales: async (days: number = 30): Promise<SalesStats> => {
      const response = await fetch(
        `${API_BASE_URL}/stats/sales?days=${encodeURIComponent(String(days))}`
      );
      return handleResponse<SalesStats>(response);
    },

    getVisits: async (days: number = 30): Promise<VisitsStats> => {
      const response = await fetch(
        `${API_BASE_URL}/stats/visits?days=${encodeURIComponent(String(days))}`
      );
      return handleResponse<VisitsStats>(response);
    },
  },
};

export { ApiError };
