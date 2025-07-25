import type { Product, ProductFormData, ProductFilters, ProductsResponse } from '../types';
import { apiService } from './api';

class ProductService {
  async getProducts(filters?: ProductFilters): Promise<ProductsResponse> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.lineId) params.append('lineId', filters.lineId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.tags) params.append('tags', filters.tags);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/products?${queryString}` : '/api/products';
    
    return apiService.get<ProductsResponse>(endpoint);
  }

  async getProduct(id: string): Promise<Product> {
    return apiService.get<Product>(`/api/products/${id}`);
  }

  async createProduct(data: ProductFormData): Promise<Product> {
    return apiService.post<Product>('/api/products', data);
  }

  async updateProduct(id: string, data: Partial<ProductFormData>): Promise<Product> {
    return apiService.put<Product>(`/api/products/${id}`, data);
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/api/products/${id}`);
  }

  async searchProducts(query: string): Promise<Product[]> {
    return apiService.get<Product[]>(`/api/products/search?q=${encodeURIComponent(query)}`);
  }

  async exportProducts(): Promise<Blob> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/export`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export products');
    }
    
    return response.blob();
  }

  async importProducts(file: File): Promise<{ imported: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to import products');
    }
    
    return response.json();
  }
}

export const productService = new ProductService();