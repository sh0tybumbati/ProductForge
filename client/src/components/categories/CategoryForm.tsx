import { useState, useCallback, memo } from 'react';
import type { Category, CategoryFormData } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';

interface CategoryFormProps {
  category?: Category;
  onSave: (categoryData: CategoryFormData) => void;
  onCancel: () => void;
}

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet  
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6b7280', // Gray
];

const CategoryForm = memo<CategoryFormProps>(({ category, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || '',
    description: category?.description || '',
    color: category?.color || PRESET_COLORS[0],
  });

  const [errors, setErrors] = useState<Partial<CategoryFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<CategoryFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Category name must be less than 50 characters';
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

  const handleInputChange = useCallback((field: keyof CategoryFormData) => (
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleColorSelect = useCallback((color: string) => {
    setFormData(prev => ({ ...prev, color }));
  }, []);

  return (
    <div className="bg-card rounded-lg border border-default">
      <div className="border-b border-light p-6">
        <h2 className="text-xl font-semibold text-primary">
          {category ? 'Edit Category' : 'Create New Category'}
        </h2>
        <p className="text-secondary text-sm mt-1">
          {category 
            ? 'Update the category information below' 
            : 'Fill in the details to create a new product category'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Category Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-primary mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name')(e.target.value)}
              error={errors.name}
              placeholder="e.g., Electronics, Clothing, Books"
              maxLength={50}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted mt-1">
              {formData.name.length}/50 characters
            </p>
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
              placeholder="Brief description of what products belong in this category..."
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

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Category Color
            </label>
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                style={{ backgroundColor: formData.color }}
              />
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                      formData.color === color 
                        ? 'border-gray-900 dark:border-gray-100 shadow-md' 
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: color }}
                    disabled={isSubmitting}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted mt-1">
              Choose a color to help visually identify this category
            </p>
          </div>

          {/* Custom Color Input */}
          <div>
            <label htmlFor="customColor" className="block text-sm font-medium text-primary mb-2">
              Custom Color <span className="text-muted">(Optional)</span>
            </label>
            <div className="flex items-center space-x-3">
              <input
                id="customColor"
                type="color"
                value={formData.color}
                onChange={(e) => handleColorSelect(e.target.value)}
                className="w-12 h-10 border border-default rounded cursor-pointer"
                disabled={isSubmitting}
              />
              <Input
                type="text"
                value={formData.color}
                onChange={(e) => handleColorSelect(e.target.value)}
                placeholder="#6366f1"
                pattern="^#[0-9A-Fa-f]{6}$"
                disabled={isSubmitting}
              />
            </div>
          </div>
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
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{category ? 'Updating...' : 'Creating...'}</span>
              </div>
            ) : (
              category ? 'Update Category' : 'Create Category'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
});

export default CategoryForm;