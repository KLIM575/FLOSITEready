import React from 'react';
import { Product } from '../../types';

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
