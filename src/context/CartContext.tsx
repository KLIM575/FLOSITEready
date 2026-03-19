import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { CartItem, Product, ProductSize } from '../types/index';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, size?: ProductSize) => void;
  removeFromCart: (productId: string, size?: ProductSize) => void;
  updateQuantity: (productId: string, quantity: number, size?: ProductSize) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity: number, size?: ProductSize) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.product.id === product.id && item.size === size
      );
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { product, quantity, size }];
    });
  };

  const removeFromCart = (productId: string, size?: ProductSize) => {
    setItems(prevItems => 
      prevItems.filter(item => 
        !(item.product.id === productId && item.size === size)
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, size?: ProductSize) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId && item.size === size 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      let price = item.product.price;
      if (item.size && item.product.sizes) {
        const sizePrice = item.product.sizes.find(s => s.size === item.size);
        if (sizePrice) {
          price = sizePrice.price;
        }
      }
      return total + price * item.quantity;
    }, 0);
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, getTotalPrice, getItemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
