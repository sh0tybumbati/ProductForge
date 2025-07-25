import { memo, useState, useCallback } from 'react';
import type { ProductLine, Category } from '../../types';
import Button from '../common/Button';
import FilterDropdown from '../common/FilterDropdown';

interface ProductLineListProps {
  lines: ProductLine[];
  categories: Category[];
  loading: boolean;
  onEdit: (line: ProductLine) => void;
  onDelete: (lineId: string) => void;
  onCreate: () => void;
}

interface FilterOptions {
  categoryFilters: string[];
}

const ProductLineCard = memo<{
  line: ProductLine;
  onEdit: (line: ProductLine) => void;
  onDelete: (lineId: string) => void;
}>(({ line, onEdit, onDelete }) => {
  const handleDelete = useCallback(() => {
    if (confirm(`Are you sure you want to delete "${line.name}"? This will also delete all associated products.`)) {
      onDelete(line.id);
    }
  }, [line.id, line.name, onDelete]);

  return (
    <div className="bg-card rounded-lg border border-default p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: line.category.color || '#6366f1' }}
          />
          <div>
            <h3 className="text-lg font-semibold text-primary">{line.name}</h3>
            {line.description && (
              <p className="text-secondary text-sm mt-1 line-clamp-2">
                {line.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center text-xs text-secondary mb-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-light">
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z" />
            </svg>
            <span className="font-medium">{line.category.name}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted mb-4">
        <div className="flex items-center space-x-4">
          <span>{line.products?.length || 0} products</span>
          <span>Created {new Date(line.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onEdit(line)}
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

const ProductLineList = memo<ProductLineListProps>(({ 
  lines, 
  categories,
  loading, 
  onEdit, 
  onDelete, 
  onCreate 
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    categoryFilters: []
  });

  // Create filter options from categories
  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name,
    count: lines.filter(line => line.categoryId === category.id).length
  }));

  // Filter lines based on selected categories
  const filteredLines = filters.categoryFilters.length > 0
    ? lines.filter(line => filters.categoryFilters.includes(line.categoryId))
    : lines;

  const updateFilters = useCallback((updates: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ categoryFilters: [] });
  }, []);

  const hasActiveFilters = filters.categoryFilters.length > 0;

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-1">Product Lines</h2>
            <p className="text-secondary">Loading product lines...</p>
          </div>
          <Button variant="primary" disabled>
            Create Product Line
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-card border border-default rounded-lg p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-2/3"></div>
              <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded mb-4"></div>
              <div className="flex justify-between items-center mb-4">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
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
          <h2 className="text-2xl font-bold text-primary mb-1">Product Lines</h2>
          <p className="text-secondary">
            {filteredLines.length !== lines.length 
              ? `${filteredLines.length} of ${lines.length} product lines` 
              : lines.length === 1 
                ? '1 product line' 
                : `${lines.length} product lines`}
          </p>
        </div>
        <Button variant="primary" onClick={onCreate} className="lg:ml-4 shrink-0">
          Create Product Line
        </Button>
      </div>

      {/* Filters */}
      {categories.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <FilterDropdown
              label="Category"
              options={categoryOptions}
              selectedValues={filters.categoryFilters}
              onChange={(values) => updateFilters({ categoryFilters: values })}
            />
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} size="sm" className="shrink-0">
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {lines.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">No product lines yet</h3>
            <p className="text-secondary mb-6">
              {categories.length === 0 
                ? 'Create some categories first, then add product lines to organize your products.'
                : 'Get started by creating your first product line within a category.'}
            </p>
            {categories.length > 0 ? (
              <Button variant="primary" onClick={onCreate}>
                Create Your First Product Line
              </Button>
            ) : (
              <p className="text-muted text-sm">Categories are required before creating product lines</p>
            )}
          </div>
        </div>
      ) : filteredLines.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">No product lines found</h3>
            <p className="text-secondary mb-6">Try adjusting your filters to find what you're looking for.</p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {filteredLines.map(line => (
            <ProductLineCard
              key={line.id}
              line={line}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default ProductLineList;