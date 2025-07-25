import type { User, UserFormData, UserProfileData, ActivityLog } from '../types';
import { apiService } from './api';

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ActivityLogsResponse {
  logs: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class UserService {
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<UsersResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.role) searchParams.append('role', params.role);
    if (params?.status) searchParams.append('status', params.status);
    
    const endpoint = `/api/users${searchParams.toString() ? `?${searchParams}` : ''}`;
    return apiService.get<UsersResponse>(endpoint);
  }

  async getUser(id: string): Promise<User> {
    return apiService.get<User>(`/api/users/${id}`);
  }

  async createUser(data: UserFormData): Promise<User> {
    return apiService.post<User>('/api/users', data);
  }

  async updateUser(id: string, data: Partial<UserFormData>): Promise<User> {
    return apiService.put<User>(`/api/users/${id}`, data);
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/api/users/${id}`);
  }

  async updateUserStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<User> {
    return apiService.put<User>(`/api/users/${id}/status`, { status });
  }

  async updateProfile(data: UserProfileData): Promise<User> {
    return apiService.put<User>('/api/users/me', data);
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    return apiService.put<void>('/api/users/me/password', data);
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return apiService.post<{ avatarUrl: string }>('/api/users/me/avatar', formData);
  }

  async getActivityLogs(params?: {
    userId?: string;
    page?: number;
    limit?: number;
    action?: string;
    resource?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ActivityLogsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.userId) searchParams.append('userId', params.userId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.action) searchParams.append('action', params.action);
    if (params?.resource) searchParams.append('resource', params.resource);
    if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.append('dateTo', params.dateTo);
    
    const endpoint = `/api/activity-logs${searchParams.toString() ? `?${searchParams}` : ''}`;
    return apiService.get<ActivityLogsResponse>(endpoint);
  }

  async inviteUser(data: { email: string; role: string; message?: string }): Promise<{ message: string }> {
    return apiService.post<{ message: string }>('/api/users/invite', data);
  }

  async resendInvite(userId: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(`/api/users/${userId}/resend-invite`);
  }
}

export const userService = new UserService();