import { useState, useEffect, useCallback } from 'react';
import type { User, UserFormData } from '../types';
import { userService } from '../services/userService';

interface UseUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export const useUsers = (params?: UseUsersParams) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getUsers(params);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [params?.page, params?.limit, params?.search, params?.role, params?.status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (userData: UserFormData): Promise<User> => {
    const newUser = await userService.createUser(userData);
    setUsers(prev => [newUser, ...prev]);
    return newUser;
  };

  const updateUser = async (id: string, userData: Partial<UserFormData>): Promise<User> => {
    const updatedUser = await userService.updateUser(id, userData);
    setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
    return updatedUser;
  };

  const deleteUser = async (id: string): Promise<void> => {
    await userService.deleteUser(id);
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const updateUserStatus = async (id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<User> => {
    const updatedUser = await userService.updateUserStatus(id, status);
    setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
    return updatedUser;
  };

  const inviteUser = async (data: { email: string; role: string; message?: string }) => {
    await userService.inviteUser(data);
    // Refresh the users list after sending invitation
    fetchUsers();
  };

  return {
    users,
    loading,
    error,
    pagination,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    inviteUser,
    refresh: fetchUsers
  };
};