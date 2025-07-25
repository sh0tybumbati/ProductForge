import { memo } from 'react';
import type { Product } from '../../types';
import Button from '../common/Button';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onViewDetails: (productId: string) => void;
}

// Memoized status configuration to prevent recreation on every render
const STATUS_CONFIG = {
  DRAFT: { color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600', label: 'Draft', icon: '✏️' },
  ACTIVE: { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700', label: 'Active', icon: '✅' },
  DISCONTINUED: { color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700', label: 'Discontinued', icon: '⚠️' },
  ARCHIVED: { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700', label: 'Archived', icon: '📦' }
} as const;

const ProductStatus = memo<{ status: Product['status'] }>(({ status }) => {

  const config = STATUS_CONFIG[status];
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.color} shadow-sm`}>
      <span className="text-xs">{config.icon}</span>
      {config.label}
    </span>
  );
});

const ProductCard = memo<ProductCardProps>(({ 
  product, 
  onEdit, 
  onDelete, 
  onViewDetails 
}) => {
  usePerformanceMonitor('ProductCard');
  const latestVersion = product.versions?.[0];
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group shadow-md">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
            <h3 className="text-lg font-semibold text-primary line-clamp-1 sm:truncate">
              {product.name}
            </h3>
            <ProductStatus status={product.status} />
          </div>
        
          {product.description && (
            <p className="text-secondary text-sm mb-4 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
            
          <div className="flex flex-wrap items-center text-xs text-muted gap-x-3 gap-y-1 mb-4">
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
              <span>SKU: {product.sku || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span>v{latestVersion?.version || '1.0'}</span>
            </div>
            {product._count && (
              <>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span className="hidden sm:inline">{product._count.versions} versions</span>
                  <span className="sm:hidden">{product._count.versions}v</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  <span className="hidden sm:inline">{product._count.comments} comments</span>
                  <span className="sm:hidden">{product._count.comments}c</span>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center text-xs text-secondary mb-4 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-light">
            <div className="flex items-center space-x-1 min-w-0">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z" />
              </svg>
              <span className="font-medium truncate">{product.line.category.name}</span>
            </div>
            <span className="mx-2 text-muted flex-shrink-0">›</span>
            <span className="font-medium truncate">{product.line.name}</span>
          </div>
          
          {product.tags && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                {product.tags}
              </span>
            </div>
          )}
          </div>
          
        {product.imageUrl && (
          <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 self-start">
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="w-16 h-16 sm:w-16 sm:h-16 object-cover rounded-lg shadow-sm border border-default"
            />
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-muted mb-4 sm:mb-6 pt-4 border-t border-light gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-white">
              {product.createdBy.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <span>by {product.createdBy.name}</span>
        </div>
        <span className="sm:text-right">{new Date(product.createdAt).toLocaleDateString()}</span>
      </div>
    
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => onViewDetails(product.id)}
          className="flex-1 order-1"
        >
          <span className="sm:hidden">View</span>
          <span className="hidden sm:inline">View Details</span>
        </Button>
        <div className="flex gap-2 order-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(product)}
            className="flex-1 sm:flex-none"
          >
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDelete(product.id)}
            className="flex-1 sm:flex-none text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;