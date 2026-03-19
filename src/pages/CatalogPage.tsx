import React from 'react';

const CatalogPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Каталог цветов</h1>
          <p className="text-xl text-gray-600">Выберите идеальный букет для вашего случая</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🌺</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Каталог в разработке
          </h2>
          <p className="text-gray-600 mb-6">
            Скоро здесь появится полный каталог наших цветов и букетов
          </p>
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;
