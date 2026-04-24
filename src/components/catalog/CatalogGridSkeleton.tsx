import React from 'react';

const COLUMNS_GRID: Record<string, string> = {
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

interface CatalogGridSkeletonProps {
  catalogColumns: string;
  count?: number;
}

const CatalogGridSkeleton: React.FC<CatalogGridSkeletonProps> = ({
  catalogColumns,
  count = 8,
}) => {
  const grid = COLUMNS_GRID[catalogColumns] ?? COLUMNS_GRID['3'];
  return (
    <div
      className={`grid gap-8 ${grid}`}
      aria-busy="true"
      aria-label="Загрузка каталога"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl overflow-hidden shadow-lg animate-pulse"
        >
          <div className="aspect-square bg-gray-200" />
          <div className="p-6 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-5 bg-gray-200 rounded w-4/5" />
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
            <div className="flex justify-between pt-2">
              <div className="h-6 bg-gray-200 rounded w-24" />
              <div className="h-9 bg-gray-200 rounded-lg w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CatalogGridSkeleton;
