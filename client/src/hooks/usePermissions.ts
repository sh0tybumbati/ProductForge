import { useMemo } from 'react';
import type { User } from '../types';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions, 
  canPerformAction,
  getUserPermissions,
  canManageUser
} from '../utils/permissions';

/**
 * Hook for checking user permissions
 */
export const usePermissions = (user: User | null) => {
  const permissions = useMemo(() => getUserPermissions(user), [user]);

  const can = useMemo(() => ({
    // Direct permission checks
    hasPermission: (permission: string) => hasPermission(user, permission),
    hasAnyPermission: (perms: string[]) => hasAnyPermission(user, perms),
    hasAllPermissions: (perms: string[]) => hasAllPermissions(user, perms),
    
    // Resource-based action checks
    viewUsers: () => canPerformAction(user, 'users', 'view'),
    createUsers: () => canPerformAction(user, 'users', 'create'),
    editUsers: () => canPerformAction(user, 'users', 'edit'),
    deleteUsers: () => canPerformAction(user, 'users', 'delete'),
    manageUserRoles: () => canPerformAction(user, 'users', 'manage_roles'),
    
    viewProducts: () => canPerformAction(user, 'products', 'view'),
    createProducts: () => canPerformAction(user, 'products', 'create'),
    editProducts: () => canPerformAction(user, 'products', 'edit'),
    deleteProducts: () => canPerformAction(user, 'products', 'delete'),
    
    viewCategories: () => canPerformAction(user, 'categories', 'view'),
    createCategories: () => canPerformAction(user, 'categories', 'create'),
    editCategories: () => canPerformAction(user, 'categories', 'edit'),
    deleteCategories: () => canPerformAction(user, 'categories', 'delete'),
    
    viewLines: () => canPerformAction(user, 'lines', 'view'),
    createLines: () => canPerformAction(user, 'lines', 'create'),
    editLines: () => canPerformAction(user, 'lines', 'edit'),
    deleteLines: () => canPerformAction(user, 'lines', 'delete'),
    
    viewReports: () => canPerformAction(user, 'reports', 'view'),
    exportReports: () => canPerformAction(user, 'reports', 'export'),
    
    viewActivityLogs: () => canPerformAction(user, 'activity', 'view'),
    manageSystemSettings: () => canPerformAction(user, 'system', 'settings'),
    
    // User-specific checks
    manageUser: (targetUser: User) => canManageUser(user, targetUser),
  }), [user]);

  const role = user?.role;
  const isAdmin = role === 'ADMIN';
  const isEditor = role === 'EDITOR'; 
  const isViewer = role === 'VIEWER';

  return {
    permissions,
    can,
    role,
    isAdmin,
    isEditor,
    isViewer,
    user
  };
};