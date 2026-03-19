export const PRODUCT_CATEGORIES = [
  'Букеты',
  'Розы',
  'Тюльпаны',
  'Пионы',
  'Орхидеи',
  'Композиции',
  'Подарочные наборы',
] as const;

export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const ROUTES = {
  HOME: '/',
  CATALOG: '/catalog',
  PRODUCT: '/product/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  PROFILE: '/profile',
  ADMIN: '/admin',
} as const;
