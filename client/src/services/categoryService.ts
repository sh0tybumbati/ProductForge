import type { Category, CategoryFormData } from '../types';
import { apiService } from './api';

class CategoryService {
  async getCategories(): Promise<Category[]> {
    return apiService.get<Category[]>('/api/categories');
  }

  async getCategory(id: string): Promise<Category> {
    return apiService.get<Category>(`/api/categories/${id}`);
  }

  async createCategory(data: CategoryFormData): Promise<Category> {
    return apiService.post<Category>('/api/categories', data);
  }

  async updateCategory(id: string, data: Partial<CategoryFormData>): Promise<Category> {
    return apiService.put<Category>(`/api/categories/${id}`, data);
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/api/categories/${id}`);
  }
}

export const categoryService = new CategoryService();