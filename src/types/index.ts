export type ProductSize = 'S' | 'M' | 'L' | 'XL';

export interface ProductSizePrice {
  size: ProductSize;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sizes?: ProductSizePrice[];
  image: string;
  images?: string[];
  category: string;
  inStock: boolean;
  quantity?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: ProductSize;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: Address;
  role: 'user' | 'admin';
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: number;
  order_id: string;
  product_id: string;
  product_name?: string;
  product_image?: string;
  quantity: number;
  size?: ProductSize;
  price: number;
}

export interface Order {
  id: string;
  userId?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: any;
  createdAt: Date;
  updatedAt: Date;
}
