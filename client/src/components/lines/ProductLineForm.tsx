import { useState, useCallback, memo } from 'react';
import type { ProductLine, LineFormData, Category } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';

interface ProductLineFormProps {
  line?: ProductLine;
  categories: Category[];
  onSave: (lineData: LineFormData) => void;
  onCancel: () => void;
}

const ProductLineForm = memo<ProductLineFormProps>(({ line, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState<LineFormData>({
    name: line?.name || '',
    description: line?.description || '',
    categoryId: line?.categoryId || (categories[0]?.id || ''),
  });

  const [errors, setErrors] = useState<Partial<LineFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<LineFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product line name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Product line name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Product line name must be less than 50 characters';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSave]);

  const handleInputChange = useCallback((field: keyof LineFormData) => (
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Get selected category for color display
  const selectedCategory = categories.find(cat => cat.id === formData.categoryId);

  // Transform categories for Select component
  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name
  }));

  if (categories.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-default p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-primary mb-2">No Categories Available</h3>
        <p className="text-secondary mb-6">
          You need to create at least one category before you can add product lines.
        </p>
        <div className="flex justify-center space-x-3">
          <Button variant="outline" onClick={onCancel}>
            Go Back
          </Button>
          <Button variant="primary" onClick={() => window.location.hash = '#categories'}>
            Create Category
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-default">
      <div className="border-b border-light p-6">
        <h2 className="text-xl font-semibold text-primary">
          {line ? 'Edit Product Line' : 'Create New Product Line'}
        </h2>
        <p className="text-secondary text-sm mt-1">
          {line 
            ? 'Update the product line information below' 
            : 'Fill in the details to create a new product line'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Product Line Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-primary mb-2">
              Product Line Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name')(e.target.value)}
              error={errors.name}
              placeholder="e.g., iPhone Series, MacBook Pro, Gaming Laptops"
              maxLength={50}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted mt-1">
              {formData.name.length}/50 characters
            </p>
          </div>

          {/* Category Selection */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-primary mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-3">
              {selectedCategory && (
                <div
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: selectedCategory.color || '#6366f1' }}
                />
              )}
              <div className="flex-1">
                <Select
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId')(e.target.value)}
                  options={categoryOptions}
                  error={errors.categoryId}
                  disabled={isSubmitting}
                  placeholder="Select a category"
                />
              </div>
            </div>
            {selectedCategory && (
              <p className="text-xs text-muted mt-1 ml-7">
                This product line will belong to the "{selectedCategory.name}" category
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-primary mb-2">
              Description <span className="text-muted">(Optional)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description')(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                errors.description 
                  ? 'border-red-300 bg-red-50 dark:bg-red-900/10' 
                  : 'border-default bg-card'
              }`}
              placeholder="Brief description of this product line and what makes it unique..."
              maxLength={200}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-red-600 text-xs mt-1">{errors.description}</p>
            )}
            <p className="text-xs text-muted mt-1">
              {formData.description?.length || 0}/200 characters
            </p>
          </div>

          {/* Preview Section */}
          {selectedCategory && (
            <div className="border border-light rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
              <h4 className="text-sm font-medium text-primary mb-2">Preview</h4>
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedCategory.color || '#6366f1' }}
                />
                <div>
                  <div className="font-medium text-primary">
                    {formData.name || 'Product Line Name'}
                  </div>
                  <div className="text-xs text-secondary">
                    in {selectedCategory.name}
                  </div>
                  {formData.description && (
                    <div className="text-xs text-muted mt-1">
                      {formData.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-light">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{line ? 'Updating...' : 'Creating...'}</span>
              </div>
            ) : (
              line ? 'Update Product Line' : 'Create Product Line'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
});

export default ProductLineForm;