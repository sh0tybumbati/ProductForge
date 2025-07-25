import type { UserRole, User } from '../types';

// Define all available permissions
export const PERMISSIONS = {
  // User Management
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
  USERS_MANAGE_ROLES: 'users:manage_roles',
  
  // Product Management
  PRODUCTS_VIEW: 'products:view',
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_EDIT: 'products:edit',
  PRODUCTS_DELETE: 'products:delete',
  
  // Category Management
  CATEGORIES_VIEW: 'categories:view',
  CATEGORIES_CREATE: 'categories:create',
  CATEGORIES_EDIT: 'categories:edit',
  CATEGORIES_DELETE: 'categories:delete',
  
  // Product Line Management
  LINES_VIEW: 'lines:view',
  LINES_CREATE: 'lines:create',
  LINES_EDIT: 'lines:edit',
  LINES_DELETE: 'lines:delete',
  
  // System Management
  SYSTEM_SETTINGS: 'system:settings',
  ACTIVITY_LOGS: 'activity:view',
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
} as const;

// Role-based permissions configuration
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: [
    // Full access to everything
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_MANAGE_ROLES,
    
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_EDIT,
    PERMISSIONS.PRODUCTS_DELETE,
    
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_EDIT,
    PERMISSIONS.CATEGORIES_DELETE,
    
    PERMISSIONS.LINES_VIEW,
    PERMISSIONS.LINES_CREATE,
    PERMISSIONS.LINES_EDIT,
    PERMISSIONS.LINES_DELETE,
    
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.ACTIVITY_LOGS,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
  ],
  
  EDITOR: [
    // Can manage products, categories, and lines but not users or system settings
    PERMISSIONS.USERS_VIEW, // Can view other users but not manage them
    
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_EDIT,
    PERMISSIONS.PRODUCTS_DELETE,
    
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_EDIT,
    PERMISSIONS.CATEGORIES_DELETE,
    
    PERMISSIONS.LINES_VIEW,
    PERMISSIONS.LINES_CREATE,
    PERMISSIONS.LINES_EDIT,
    PERMISSIONS.LINES_DELETE,
    
    PERMISSIONS.REPORTS_VIEW,
  ],
  
  VIEWER: [
    // Read-only access to products and basic reports
    PERMISSIONS.USERS_VIEW, // Can view other users
    
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.LINES_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ],
};

// Role descriptions for UI
export const ROLE_DESCRIPTIONS: Record<UserRole, { title: string; description: string; color: string }> = {
  ADMIN: {
    title: 'Administrator',
    description: 'Full system access including user management, system settings, and all data operations',
    color: 'red'
  },
  EDITOR: {
    title: 'Editor',
    description: 'Can create, edit, and delete products, categories, and product lines. Cannot manage users or system settings',
    color: 'indigo'
  },
  VIEWER: {
    title: 'Viewer', 
    description: 'Read-only access to products, categories, lines, and basic reports. Cannot modify any data',
    color: 'green'
  }
};

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false;
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  return rolePermissions.includes(permission);
};

/**
 * Check if a user has any of the specified permissions
 */
export const hasAnyPermission = (user: User | null, permissions: string[]): boolean => {
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if a user has all of the specified permissions
 */
export const hasAllPermissions = (user: User | null, permissions: string[]): boolean => {
  return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Check if a user can perform an action on a resource
 */
export const canPerformAction = (
  user: User | null, 
  resource: 'users' | 'products' | 'categories' | 'lines' | 'system' | 'activity' | 'reports',
  action: 'view' | 'create' | 'edit' | 'delete' | 'manage_roles' | 'settings' | 'export'
): boolean => {
  const permission = `${resource}:${action}`;
  return hasPermission(user, permission);
};

/**
 * Get all permissions for a user's role
 */
export const getUserPermissions = (user: User | null): string[] => {
  if (!user) return [];
  return ROLE_PERMISSIONS[user.role] || [];
};

/**
 * Check if a role has higher privileges than another role
 */
export const isHigherRole = (role1: UserRole, role2: UserRole): boolean => {
  const roleHierarchy: Record<UserRole, number> = {
    ADMIN: 3,
    EDITOR: 2,
    VIEWER: 1
  };
  
  return roleHierarchy[role1] > roleHierarchy[role2];
};

/**
 * Check if a user can manage another user (based on role hierarchy)
 */
export const canManageUser = (currentUser: User | null, targetUser: User): boolean => {
  if (!currentUser) return false;
  
  // Admins can manage everyone except other admins (unless they're managing themselves)
  if (currentUser.role === 'ADMIN') {
    return targetUser.role !== 'ADMIN' || currentUser.id === targetUser.id;
  }
  
  // Editors and Viewers cannot manage other users
  return false;
};