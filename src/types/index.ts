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

/** Адрес доставки в заказе (как приходит с API / отображается в админке). */
export interface OrderShippingAddress {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  postal_code?: string;
  address?: string;
  comment?: string;
  delivery_zone_name?: string;
}

export interface Order {
  id: string;
  userId?: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee?: number;
  deliveryZoneId?: string | null;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress?: OrderShippingAddress | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryZone {
  id: string;
  name: string;
  price: number;
  sortOrder: number;
}

export interface SalesDayRow {
  date: string;
  order_count: number;
  revenue: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}

export interface SalesStats {
  period_days: number;
  total_orders: number;
  revenue_total: number;
  by_day: SalesDayRow[];
  by_status: OrderStatusCount[];
}

export interface VisitsDayRow {
  date: string;
  views: number;
}

export interface PathCount {
  path: string;
  count: number;
}

export interface VisitsStats {
  period_days: number;
  total_views: number;
  by_day: VisitsDayRow[];
  top_paths: PathCount[];
}

export type ColorTheme = 'rose' | 'violet' | 'blue' | 'emerald' | 'amber';
export type FontPair = 'default' | 'modern' | 'classic' | 'minimal';
export type CatalogColumns = '2' | '3' | '4';
export type ProductCardStyle = 'default' | 'minimal' | 'bordered';

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
