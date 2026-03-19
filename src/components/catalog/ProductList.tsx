import React from 'react';
import type { Product } from '../../types/index';

interface ProductListProps {
  products: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
  return (
    <div>
      <h2>Product List</h2>
    </div>
  );
};

export default ProductList;
