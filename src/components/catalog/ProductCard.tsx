import React from 'react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div>
      <h3>{product.name}</h3>
    </div>
  );
};

export default ProductCard;
