import React, { useState, useEffect } from 'react';
import type { Product, ProductFormData, Category } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSave: (productData: ProductFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  product, 
  categories, 
  onSave, 
  onCancel, 
  loading 
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || '',
    description: product?.description || '',
    sku: product?.sku || '',
    status: product?.status || 'DRAFT',
    tags: product?.tags || '',
    lineId: product?.lineId || '',
    customFields: product?.customFields || undefined,
    imageUrl: product?.imageUrl || ''
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState(
    product?.line.categoryId || ''
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableLines = categories.find(c => c.id === selectedCategoryId)?.lines || [];

  useEffect(() => {
    if (selectedCategoryId && !availableLines.find(l => l.id === formData.lineId)) {
      setFormData(prev => ({ ...prev, lineId: '' }));
    }
  }, [selectedCategoryId, availableLines, formData.lineId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.lineId) {
      newErrors.lineId = 'Product line is required';
    }

    if (formData.sku && formData.sku.length < 3) {
      newErrors.sku = 'SKU must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };


  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name
  }));

  const lineOptions = availableLines.map(line => ({
    value: line.id,
    label: line.name
  }));

  const statusOptions = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'DISCONTINUED', label: 'Discontinued' },
    { value: 'ARCHIVED', label: 'Archived' }
  ];

  return (
    <div className="bg-card rounded-lg border border-default p-6">
      <h2 className="text-xl font-semibold mb-6 text-primary">
        {product ? 'Edit Product' : 'Create New Product'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Product Name *"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            placeholder="Enter product name"
          />
          
          <Input
            label="SKU"
            value={formData.sku}
            onChange={(e) => handleInputChange('sku', e.target.value)}
            error={errors.sku}
            placeholder="Enter SKU (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter product description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Select
            label="Category *"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            options={categoryOptions}
            placeholder="Select category"
          />
          
          <Select
            label="Product Line *"
            value={formData.lineId}
            onChange={(e) => handleInputChange('lineId', e.target.value)}
            options={lineOptions}
            placeholder="Select product line"
            error={errors.lineId}
            disabled={!selectedCategoryId}
          />
          
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value as ProductFormData['status'])}
            options={statusOptions}
          />
        </div>

        <Input
          label="Image URL"
          value={formData.imageUrl}
          onChange={(e) => handleInputChange('imageUrl', e.target.value)}
          placeholder="Enter image URL (optional)"
        />

        <Input
          label="Tags"
          value={formData.tags}
          onChange={(e) => handleInputChange('tags', e.target.value)}
          placeholder="Enter tags (comma-separated)"
          helperText="Enter tags separated by commas"
        />

        <div className="flex justify-end space-x-3 pt-6 border-t border-light">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading} loading={loading}>
            {product ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;