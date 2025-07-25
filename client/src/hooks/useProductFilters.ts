import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import type { Product } from '../types';

interface UseProductFiltersProps {
  products: Product[];
}

interface FilterOptions {
  searchQuery: string;
  statusFilters: string[];
  categoryFilters: string[];
  sortBy: 'name' | 'date' | 'status';
  sortOrder: 'asc' | 'desc';
}

export const useProductFilters = ({ products }: UseProductFiltersProps) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    statusFilters: [],
    categoryFilters: [],
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Debounce search query to prevent excessive filtering
  const debouncedSearchQuery = useDebounce(filters.searchQuery, 300);

  // Get unique categories and statuses for filter options
  const filterOptions = useMemo(() => {
    const categories = new Map<string, { name: string; count: number }>();
    const statuses = new Map<string, number>();

    products.forEach(product => {
      // Count categories
      const categoryKey = product.line.category.id;
      const categoryName = product.line.category.name;
      categories.set(categoryKey, {
        name: categoryName,
        count: (categories.get(categoryKey)?.count || 0) + 1
      });

      // Count statuses
      statuses.set(product.status, (statuses.get(product.status) || 0) + 1);
    });

    return {
      categories: Array.from(categories.entries()).map(([value, data]) => ({
        value,
        label: data.name,
        count: data.count
      })),
      statuses: Array.from(statuses.entries()).map(([value, count]) => ({
        value,
        label: value.charAt(0) + value.slice(1).toLowerCase(),
        count
      }))
    };
  }, [products]);

  // Filter and sort products using debounced search query
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply search filter using debounced query
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.tags?.toLowerCase().includes(query) ||
        product.line.name.toLowerCase().includes(query) ||
        product.line.category.name.toLowerCase().includes(query)
      );
    }

    // Apply status filters
    if (filters.statusFilters.length > 0) {
      filtered = filtered.filter(product =>
        filters.statusFilters.includes(product.status)
      );
    }

    // Apply category filters
    if (filters.categoryFilters.length > 0) {
      filtered = filtered.filter(product =>
        filters.categoryFilters.includes(product.line.category.id)
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [products, debouncedSearchQuery, filters.statusFilters, filters.categoryFilters, filters.sortBy, filters.sortOrder]);

  const updateFilters = useCallback((updates: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      statusFilters: [],
      categoryFilters: [],
      sortBy: 'date',
      sortOrder: 'desc'
    });
  }, []);

  const hasActiveFilters = useMemo(() => 
    filters.searchQuery.trim() !== '' || 
    filters.statusFilters.length > 0 || 
    filters.categoryFilters.length > 0,
    [filters.searchQuery, filters.statusFilters.length, filters.categoryFilters.length]
  );

  return {
    filters,
    filteredProducts,
    filterOptions,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    resultCount: filteredProducts.length,
    totalCount: products.length
  };
};