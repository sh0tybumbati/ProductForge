import type { ProductVersion } from '../types';
import { apiService } from './api';

interface CreateVersionData {
  version: string;
  changelog?: string;
  releaseNotes?: string;
}

interface UpdateVersionData {
  version?: string;
  changelog?: string;
  releaseNotes?: string;
  isActive?: boolean;
}

class VersionService {
  async getVersions(productId: string): Promise<ProductVersion[]> {
    return apiService.get<ProductVersion[]>(`/api/products/${productId}/versions`);
  }

  async createVersion(productId: string, data: CreateVersionData): Promise<ProductVersion> {
    return apiService.post<ProductVersion>(`/api/products/${productId}/versions`, data);
  }

  async updateVersion(versionId: string, data: UpdateVersionData): Promise<ProductVersion> {
    return apiService.put<ProductVersion>(`/api/versions/${versionId}`, data);
  }

  async deleteVersion(versionId: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/api/versions/${versionId}`);
  }

  async setActiveVersion(versionId: string): Promise<ProductVersion> {
    return apiService.patch<ProductVersion>(`/api/versions/${versionId}/activate`);
  }
}

export const versionService = new VersionService();