import React from 'react';
import { CartItem as CartItemType } from '../../types';

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
