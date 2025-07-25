export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: User;
  avatar?: string;
  department?: string;
  jobTitle?: string;
  bio?: string;
  phone?: string;
  location?: string;
}

export interface UserFormData {
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  jobTitle?: string;
}

export interface UserProfileData {
  name: string;
  email: string;
  department?: string;
  jobTitle?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  location?: string;
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  user: User;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  lines?: ProductLine[];
}

export interface ProductLine {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  category: Category;
  products?: Product[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  status: 'DRAFT' | 'ACTIVE' | 'DISCONTINUED' | 'ARCHIVED';
  tags: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  lineId: string;
  line: ProductLine;
  versions?: ProductVersion[];
  comments?: Comment[];
  customFields?: Record<string, unknown>;
  _count?: {
    versions: number;
    comments: number;
  };
}

export interface ProductVersion {
  id: string;
  version: string;
  changelog?: string;
  releaseNotes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productId: string;
  product?: Product;
  createdBy: User;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: User;
  productId: string;
  product?: Product;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  lineId?: string;
  status?: string;
  tags?: string;
  page?: number;
  limit?: number;
}

export interface ProductFormData {
  name: string;
  description?: string;
  sku?: string;
  status: 'DRAFT' | 'ACTIVE' | 'DISCONTINUED' | 'ARCHIVED';
  tags: string;
  lineId: string;
  customFields?: Record<string, unknown>;
  imageUrl?: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  color?: string;
}

export interface LineFormData {
  name: string;
  description?: string;
  categoryId: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: PaginationData;
}