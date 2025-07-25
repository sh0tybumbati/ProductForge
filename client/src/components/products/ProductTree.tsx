import { useState, memo } from 'react';
import type { Category, ProductLine, Product } from '../../types';

interface ProductTreeProps {
  categories: Category[];
  onSelectProduct: (productId: string) => void;
  selectedProductId?: string;
  loading?: boolean;
}

interface CategoryNodeProps {
  category: Category;
  onSelectProduct: (productId: string) => void;
  selectedProductId?: string;
}

const CategoryNode = memo<CategoryNodeProps>(({ 
  category, 
  onSelectProduct, 
  selectedProductId 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-1">
      <div
        className="flex items-center p-2 rounded-lg hover-bg cursor-pointer transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="mr-2 text-sm">
          {isExpanded ? '📂' : '📁'}
        </span>
        <div
          className="w-3 h-3 rounded mr-2"
          style={{ backgroundColor: category.color || '#6366f1' }}
        />
        <span className="font-medium text-primary">{category.name}</span>
        <span className="ml-2 text-xs text-muted">
          ({category.lines?.length || 0} lines)
        </span>
      </div>
      
      {isExpanded && category.lines && (
        <div className="ml-6 mt-1">
          {category.lines.map(line => (
            <LineNode
              key={line.id}
              line={line}
              onSelectProduct={onSelectProduct}
              selectedProductId={selectedProductId}
            />
          ))}
        </div>
      )}
    </div>
  );
});

interface LineNodeProps {
  line: ProductLine;
  onSelectProduct: (productId: string) => void;
  selectedProductId?: string;
}

const LineNode = memo<LineNodeProps>(({ 
  line, 
  onSelectProduct, 
  selectedProductId 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-1">
      <div
        className="flex items-center p-2 rounded-md hover-bg-soft cursor-pointer transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="mr-2 text-sm">
          {isExpanded ? '📋' : '📄'}
        </span>
        <span className="text-secondary font-medium">{line.name}</span>
        <span className="ml-2 text-xs text-muted">
          ({line.products?.length || 0} products)
        </span>
      </div>
      
      {isExpanded && line.products && (
        <div className="ml-6 mt-1">
          {line.products.map(product => (
            <ProductNode
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              isSelected={selectedProductId === product.id}
            />
          ))}
        </div>
      )}
    </div>
  );
});

interface ProductNodeProps {
  product: Product;
  onSelectProduct: (productId: string) => void;
  isSelected: boolean;
}

// Memoized status icons to prevent recreation
const STATUS_ICONS = {
  DRAFT: '📝',
  ACTIVE: '✅',
  DISCONTINUED: '⚠️',
  ARCHIVED: '📦'
} as const;

const ProductNode = memo<ProductNodeProps>(({ 
  product, 
  onSelectProduct, 
  isSelected 
}) => {

  return (
    <div
      className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700' 
          : 'hover-bg-soft'
      }`}
      onClick={() => onSelectProduct(product.id)}
    >
      <span className="mr-2 text-sm">
        {STATUS_ICONS[product.status]}
      </span>
      <span className={`text-sm ${isSelected ? 'text-indigo-900 dark:text-indigo-100 font-medium' : 'text-secondary'}`}>
        {product.name}
      </span>
      {product.sku && (
        <span className="ml-2 text-xs text-muted">
          ({product.sku})
        </span>
      )}
    </div>
  );
});

const ProductTree = memo<ProductTreeProps>(({ 
  categories, 
  onSelectProduct, 
  selectedProductId, 
  loading 
}) => {
  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-default p-6">
        <h3 className="text-lg font-semibold mb-4 text-primary">Products</h3>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-default p-6">
      <h3 className="text-lg font-semibold mb-4 text-primary">Products</h3>
      {categories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted text-sm">No categories found</p>
          <p className="text-muted text-xs mt-2">Create some categories to get started</p>
        </div>
      ) : (
        <div className="space-y-1">
          {categories.map(category => (
            <CategoryNode 
              key={category.id} 
              category={category}
              onSelectProduct={onSelectProduct}
              selectedProductId={selectedProductId}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default ProductTree;