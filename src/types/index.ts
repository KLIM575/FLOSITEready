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

export type ColorTheme = 'rose' | 'violet' | 'blue' | 'emerald' | 'amber';
export type FontPair = 'default' | 'modern' | 'classic' | 'minimal';
export type CatalogColumns = '2' | '3' | '4';
export type ProductCardStyle = 'default' | 'minimal' | 'bordered';
export type ButtonStyle = 'rounded' | 'square' | 'pill';

export interface AppearanceSettings {
  colorTheme: ColorTheme;
  fontPair: FontPair;
  logoUrl: string;
  faviconUrl: string;
  bannerBgImage: string;
  bannerBgColor: string;
  bannerButtonText: string;
  bannerButtonLink: string;
  darkModeEnabled: boolean;
  catalogColumns: CatalogColumns;
  productCardStyle: ProductCardStyle;
  footerCopyright: string;
  buttonStyle: ButtonStyle;
  buttonShadow: boolean;
}

export interface SiteSettings {
  shopName: string;
  shopTagline: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  socialInstagram: string;
  socialVk: string;
  socialTelegram: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerEnabled: boolean;
  deliveryInfo: string;
  paymentInfo: string;
  freeDeliveryFrom: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}
