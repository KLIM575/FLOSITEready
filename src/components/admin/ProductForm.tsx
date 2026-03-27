import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import type { Product, ProductSize, ProductSizePrice } from '../../types/index';

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
}

type ImageEntry =
  | { type: 'url'; url: string }
  | { type: 'file'; file: File; previewUrl: string };

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    inStock: true,
    image: '',
  });

  const [sizes, setSizes] = useState<ProductSizePrice[]>([]);
  const [imageEntries, setImageEntries] = useState<ImageEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Main image state
  const [mainImageMode, setMainImageMode] = useState<'url' | 'file'>('url');
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState('');

  // Additional image add panel state
  const [showAddUrlInput, setShowAddUrlInput] = useState(false);
  const [addImageUrl, setAddImageUrl] = useState('');

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        inStock: product.inStock,
        image: product.image,
      });
      setMainImagePreview(product.image);

      if (product.sizes) {
        setSizes(product.sizes.map(s => ({ size: s.size, price: s.price })));
      }

      if (product.images) {
        setImageEntries(product.images.map(url => ({ type: 'url', url })));
      }
    }
  }, [product]);

  const handleMainImageFile = (file: File) => {
    setMainImageFile(file);
    setMainImagePreview(URL.createObjectURL(file));
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleMainImageUrl = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }));
    setMainImagePreview(url);
    setMainImageFile(null);
  };

  const handleAddImageFile = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setImageEntries(prev => [...prev, { type: 'file', file, previewUrl }]);
  };

  const handleAddImageUrl = () => {
    if (!addImageUrl.trim()) return;
    setImageEntries(prev => [...prev, { type: 'url', url: addImageUrl.trim() }]);
    setShowAddUrlInput(false);
    setAddImageUrl('');
  };

  const removeImageEntry = (index: number) => {
    const entry = imageEntries[index];
    if (entry.type === 'file') {
      URL.revokeObjectURL(entry.previewUrl);
    }
    setImageEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const urlImages = imageEntries
        .filter((e): e is { type: 'url'; url: string } => e.type === 'url')
        .map(e => e.url);

      const fileImages = imageEntries.filter(
        (e): e is { type: 'file'; file: File; previewUrl: string } => e.type === 'file'
      );

      const hasMainFile = mainImageMode === 'file' && mainImageFile;

      const productData = {
        ...formData,
        image: hasMainFile ? '__pending__' : formData.image,
        sizes: sizes.length > 0 ? sizes : undefined,
        images: urlImages.length > 0 ? urlImages : undefined,
      };

      let savedProduct: Product;
      if (product) {
        savedProduct = await api.products.update(product.id, productData);
      } else {
        savedProduct = await api.products.create(productData);
      }

      // Upload main image file
      if (hasMainFile) {
        const result = await api.products.uploadImage(savedProduct.id, mainImageFile);
        await api.products.update(savedProduct.id, { image: result.url });
      }

      // Upload additional image files
      for (const entry of fileImages) {
        await api.products.uploadImage(savedProduct.id, entry.file);
      }

      onClose();
    } catch (err) {
      console.error('Failed to save product:', err);
      setError('Не удалось сохранить товар');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSize = () => {
    setSizes([...sizes, { size: 'M' as ProductSize, price: 0 }]);
  };

  const removeSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const updateSize = (index: number, field: 'size' | 'price', value: any) => {
    const newSizes = [...sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setSizes(newSizes);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {product ? 'Редактировать товар' : 'Добавить товар'}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Название */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Название *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Описание */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Описание *</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        {/* Цена и категория */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Базовая цена *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Категория *</label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Главное изображение */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Главное изображение *
          </label>

          {/* Переключатель URL / Файл */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-3 w-fit">
            <button
              type="button"
              onClick={() => { setMainImageMode('url'); setMainImageFile(null); setMainImagePreview(formData.image); }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mainImageMode === 'url'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              По URL
            </button>
            <button
              type="button"
              onClick={() => setMainImageMode('file')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mainImageMode === 'file'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Загрузить файл
            </button>
          </div>

          {mainImageMode === 'url' ? (
            <input
              type="url"
              required={!mainImageFile}
              placeholder="https://example.com/image.jpg"
              value={formData.image}
              onChange={(e) => handleMainImageUrl(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          ) : (
            <div>
              <input
                ref={mainFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleMainImageFile(file);
                }}
              />
              <button
                type="button"
                onClick={() => mainFileInputRef.current?.click()}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {mainImageFile ? mainImageFile.name : 'Выбрать файл с компьютера'}
              </button>
            </div>
          )}

          {/* Предпросмотр главного изображения */}
          {mainImagePreview && (
            <div className="mt-3 relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
              <img
                src={mainImagePreview}
                alt="Предпросмотр"
                className="w-full h-full object-cover"
                onError={() => setMainImagePreview('')}
              />
            </div>
          )}
        </div>

        {/* В наличии */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.inStock}
              onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-semibold text-gray-900">В наличии</span>
          </label>
        </div>

        {/* Размеры */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-semibold text-gray-900">Размеры и цены</label>
            <button
              type="button"
              onClick={addSize}
              className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
            >
              + Добавить размер
            </button>
          </div>

          {sizes.map((size, index) => (
            <div key={index} className="flex gap-4 mb-3">
              <select
                value={size.size}
                onChange={(e) => updateSize(index, 'size', e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
              <input
                type="number"
                min="0"
                step="0.01"
                value={size.price}
                onChange={(e) => updateSize(index, 'price', parseFloat(e.target.value))}
                placeholder="Цена"
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={() => removeSize(index)}
                className="text-red-600 hover:text-red-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Дополнительные изображения */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-semibold text-gray-900">
              Дополнительные изображения
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowAddUrlInput(prev => !prev); setAddImageUrl(''); }}
                className="text-sm font-semibold px-3 py-1.5 rounded-lg border border-primary-300 text-primary-600 hover:bg-primary-50 transition-colors"
              >
                + По URL
              </button>
              {/* Кнопка загрузки файла — hidden input всегда в DOM, кнопка триггерит его напрямую */}
              <button
                type="button"
                onClick={() => addFileInputRef.current?.click()}
                className="text-sm font-semibold px-3 py-1.5 rounded-lg border border-primary-300 text-primary-600 hover:bg-primary-50 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                + Файл
              </button>
            </div>
          </div>

          {/* Hidden file input — всегда в DOM чтобы ref работал */}
          <input
            ref={addFileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              files.forEach(file => handleAddImageFile(file));
              e.target.value = '';
            }}
          />

          {/* Поле ввода URL */}
          {showAddUrlInput && (
            <div className="flex gap-2 mb-4">
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={addImageUrl}
                onChange={(e) => setAddImageUrl(e.target.value)}
                className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImageUrl())}
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                disabled={!addImageUrl.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                Добавить
              </button>
              <button
                type="button"
                onClick={() => { setShowAddUrlInput(false); setAddImageUrl(''); }}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
              >
                Отмена
              </button>
            </div>
          )}

          {/* Сетка изображений */}
          {imageEntries.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {imageEntries.map((entry, index) => (
                <div key={index} className="relative group">
                  <img
                    src={entry.type === 'url' ? entry.url : entry.previewUrl}
                    alt={`Image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12">?</text></svg>'; }}
                  />
                  {entry.type === 'file' && (
                    <div className="absolute bottom-1 left-1 bg-primary-600 text-white text-xs px-1.5 py-0.5 rounded">
                      файл
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImageEntry(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
