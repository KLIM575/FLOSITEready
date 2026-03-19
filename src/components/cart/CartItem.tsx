import React from 'react';
import type { CartItem as CartItemType } from '../../types/index';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  return (
    <div>
      <p>{item.product.name}</p>
    </div>
  );
};

export default CartItem;
