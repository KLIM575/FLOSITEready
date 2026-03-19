import type { Product } from '../types/index';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Букет роз "Романтика"',
    description: 'Роскошный букет из свежих красных роз премиум-класса. Идеально подходит для романтических свиданий, признаний в любви и особых случаев. Розы выращены в Эквадоре, отличаются крупными бутонами и длительным сроком жизни.',
    price: 3500,
    sizes: [
      { size: 'S', price: 2500 },
      { size: 'M', price: 3500 },
      { size: 'L', price: 4500 },
      { size: 'XL', price: 6500 }
    ],
    image: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=800&fit=crop'
    ],
    category: 'Розы',
    inStock: true
  },
  {
    id: '2',
    name: 'Композиция "Весна"',
    description: 'Нежная весенняя композиция из тюльпанов, нарциссов и гиацинтов. Яркие краски и свежий аромат весны в одном букете. Идеальный подарок для создания весеннего настроения.',
    price: 2800,
    sizes: [
      { size: 'S', price: 2000 },
      { size: 'M', price: 2800 },
      { size: 'L', price: 3800 },
      { size: 'XL', price: 5200 }
    ],
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&h=800&fit=crop'
    ],
    category: 'Композиции',
    inStock: true
  },
  {
    id: '3',
    name: 'Букет тюльпанов "Нежность"',
    description: 'Элегантный букет из голландских тюльпанов пастельных оттенков. Символ весны, обновления и нежных чувств. Тюльпаны доставляются свежими, с гарантией качества.',
    price: 2200,
    sizes: [
      { size: 'S', price: 1500 },
      { size: 'M', price: 2200 },
      { size: 'L', price: 3200 },
      { size: 'XL', price: 4500 }
    ],
    image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1584380931214-dbb5b72e7fd0?w=800&h=800&fit=crop'
    ],
    category: 'Тюльпаны',
    inStock: true
  },
  {
    id: '4',
    name: 'Орхидея в горшке',
    description: 'Изысканная орхидея фаленопсис в керамическом горшке. Долговечное растение, которое будет радовать своим цветением несколько месяцев. Включает инструкцию по уходу.',
    price: 5500,
    image: 'https://images.unsplash.com/photo-1615715616181-6b41c74ebc5d?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1615715616181-6b41c74ebc5d?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1550735424-d2d34d119598?w=800&h=800&fit=crop'
    ],
    category: 'Орхидеи',
    inStock: true
  },
  {
    id: '5',
    name: 'Букет пионов "Роскошь"',
    description: 'Роскошный букет из ароматных пионов. Эти великолепные цветы с пышными бутонами создают атмосферу праздника и изобилия. Доступны в сезон с мая по июль.',
    price: 4200,
    sizes: [
      { size: 'S', price: 3000 },
      { size: 'M', price: 4200 },
      { size: 'L', price: 5500 },
      { size: 'XL', price: 7500 }
    ],
    image: 'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=800&h=800&fit=crop'
    ],
    category: 'Пионы',
    inStock: true
  },
  {
    id: '6',
    name: 'Подарочный набор "Премиум"',
    description: 'Эксклюзивный подарочный набор включает букет из роз и пионов, бельгийский шоколад и открытку с персональным поздравлением. Упакован в дизайнерскую коробку.',
    price: 8900,
    sizes: [
      { size: 'M', price: 8900 },
      { size: 'L', price: 12500 }
    ],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&h=800&fit=crop'
    ],
    category: 'Подарочные наборы',
    inStock: true
  }
];

export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(product => product.id === id);
};
