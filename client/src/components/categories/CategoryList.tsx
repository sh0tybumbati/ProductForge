import { memo, useCallback } from 'react';
import type { Category } from '../../types';
import Button from '../common/Button';

interface CategoryListProps {
  categories: Category[];
  loading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  onCreate: () => void;
}

const CategoryCard = memo<{
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}>(({ category, onEdit, onDelete }) => {
  const handleDelete = useCallback(() => {
    if (confirm(`Are you sure you want to delete "${category.name}"? This will also delete all associated product lines and products.`)) {
      onDelete(category.id);
    }
  }, [category.id, category.name, onDelete]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 shadow-sm hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: category.color || '#6366f1' }}
          />
          <div>
            <h3 className="text-lg font-semibold text-primary">{category.name}</h3>
            {category.description && (
              <p className="text-secondary text-sm mt-1 line-clamp-2">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted mb-4">
        <div className="flex items-center space-x-4">
          <span>{category.lines?.length || 0} product lines</span>
          <span>Created {new Date(category.createdAt).toLocaleDateString()}</span>
        </div>
        <span>by {category.createdBy.name}</span>
      </div>

      <div className="flex space-x-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onEdit(category)}
          className="flex-1"
        >
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Delete
        </Button>
      </div>
    </div>
  );
});

const CategoryList = memo<CategoryListProps>(({ 
  categories, 
  loading, 
  onEdit, 
  onDelete, 
  onCreate 
}) => {
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-1">Categories</h2>
            <p className="text-secondary">Loading categories...</p>
          </div>
          <Button variant="primary" disabled>
            Create Category
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 animate-pulse shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-2/3"></div>
              <div className="flex justify-between items-center mb-4">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">Categories</h2>
          <p className="text-secondary">
            {categories.length === 1 
              ? '1 category' 
              : `${categories.length} categories`}
          </p>
        </div>
        <Button variant="primary" onClick={onCreate} className="lg:ml-4 shrink-0">
          Create Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">No categories yet</h3>
            <p className="text-secondary mb-6">Get started by creating your first product category to organize your products.</p>
            <Button variant="primary" onClick={onCreate}>
              Create Your First Category
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {categories.map(category => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default CategoryList;