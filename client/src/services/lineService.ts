import type { ProductLine, LineFormData } from '../types';
import { apiService } from './api';

class LineService {
  async getLines(categoryId?: string): Promise<ProductLine[]> {
    const endpoint = categoryId 
      ? `/api/lines?categoryId=${categoryId}` 
      : '/api/lines';
    return apiService.get<ProductLine[]>(endpoint);
  }

  async getLine(id: string): Promise<ProductLine> {
    return apiService.get<ProductLine>(`/api/lines/${id}`);
  }

  async createLine(data: LineFormData): Promise<ProductLine> {
    return apiService.post<ProductLine>('/api/lines', data);
  }

  async updateLine(id: string, data: Partial<LineFormData>): Promise<ProductLine> {
    return apiService.put<ProductLine>(`/api/lines/${id}`, data);
  }

  async deleteLine(id: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/api/lines/${id}`);
  }
}

export const lineService = new LineService();