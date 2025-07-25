import { useState, useCallback, Suspense, lazy } from 'react';
import AppLayout from './layout/AppLayout';
import ProductTree from './products/ProductTree';
import ProductCard from './products/ProductCard';

// Lazy load forms for better initial bundle size
const ProductForm = lazy(() => import('./products/ProductForm'));
const CategoryForm = lazy(() => import('./categories/CategoryForm'));
const ProductLineForm = lazy(() => import('./lines/ProductLineForm'));
const UserForm = lazy(() => import('./users/UserForm'));

// Import list components
import CategoryList from './categories/CategoryList';
import ProductLineList from './lines/ProductLineList';
import UserList from './users/UserList';
import UserProfile from './users/UserProfile';
import ToastContainer from './common/ToastContainer';
import SearchInput from './common/SearchInput';
import FilterDropdown from './common/FilterDropdown';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useProductLines } from '../hooks/useProductLines';
import { useUsers } from '../hooks/useUsers';
import { usePermissions } from '../hooks/usePermissions';
import { useToast } from '../hooks/useToast';
import { useProductFilters } from '../hooks/useProductFilters';
import type { User, Product, ProductFormData, Category, ProductLine, CategoryFormData, LineFormData, UserFormData, UserStatus } from '../types';
import Button from './common/Button';

interface AppWrapperProps {
  user: User;
  onLogout: () => void;
}

function AppWrapper({ user, onLogout }: AppWrapperProps) {
  const [activeView, setActiveView] = useState('products');
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  
  // Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  
  // Category form state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  
  // Product line form state
  const [showLineForm, setShowLineForm] = useState(false);
  const [editingLine, setEditingLine] = useState<ProductLine | undefined>();
  
  // User form state
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilters, setUserFilters] = useState<{ role?: string; status?: string }>({});
  
  const { products, loading: productsLoading, createProduct, updateProduct, deleteProduct } = useProducts();
  const { categories, loading: categoriesLoading, createCategory, updateCategory, deleteCategory } = useCategories();
  const { lines, loading: linesLoading, createLine, updateLine, deleteLine } = useProductLines();
  const { users, loading: usersLoading, createUser, updateUser, deleteUser, updateUserStatus } = useUsers({
    search: userSearchQuery,
    ...userFilters
  });
  const { can } = usePermissions(user);
  const { success, error } = useToast();
  
  const {
    filters,
    filteredProducts,
    filterOptions,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    resultCount,
    totalCount
  } = useProductFilters({ products });

  const handleCreateProduct = useCallback(() => {
    setEditingProduct(undefined);
    setShowProductForm(true);
  }, []);

  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  }, []);

  const handleSaveProduct = useCallback(async (productData: ProductFormData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        success('Product updated successfully!');
      } else {
        await createProduct(productData);
        success('Product created successfully!');
      }
      setShowProductForm(false);
      setEditingProduct(undefined);
    } catch (err) {
      console.error('Error saving product:', err);
      error('Failed to save product: ' + (err as Error).message);
    }
  }, [editingProduct, updateProduct, createProduct, success, error]);

  const handleDeleteProduct = useCallback(async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        success('Product deleted successfully!');
      } catch (err) {
        console.error('Error deleting product:', err);
        error('Failed to delete product: ' + (err as Error).message);
      }
    }
  }, [deleteProduct, success, error]);

  // Category handlers
  const handleCreateCategory = useCallback(() => {
    setEditingCategory(undefined);
    setShowCategoryForm(true);
  }, []);

  const handleEditCategory = useCallback((category: Category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  }, []);

  const handleSaveCategory = useCallback(async (categoryData: CategoryFormData) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
        success('Category updated successfully!');
      } else {
        await createCategory(categoryData);
        success('Category created successfully!');
      }
      setShowCategoryForm(false);
      setEditingCategory(undefined);
    } catch (err) {
      console.error('Error saving category:', err);
      error('Failed to save category: ' + (err as Error).message);
    }
  }, [editingCategory, updateCategory, createCategory, success, error]);

  const handleDeleteCategory = useCallback(async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      success('Category deleted successfully!');
    } catch (err) {
      console.error('Error deleting category:', err);
      error('Failed to delete category: ' + (err as Error).message);
    }
  }, [deleteCategory, success, error]);

  // Product line handlers
  const handleCreateLine = useCallback(() => {
    setEditingLine(undefined);
    setShowLineForm(true);
  }, []);

  const handleEditLine = useCallback((line: ProductLine) => {
    setEditingLine(line);
    setShowLineForm(true);
  }, []);

  const handleSaveLine = useCallback(async (lineData: LineFormData) => {
    try {
      if (editingLine) {
        await updateLine(editingLine.id, lineData);
        success('Product line updated successfully!');
      } else {
        await createLine(lineData);
        success('Product line created successfully!');
      }
      setShowLineForm(false);
      setEditingLine(undefined);
    } catch (err) {
      console.error('Error saving product line:', err);
      error('Failed to save product line: ' + (err as Error).message);
    }
  }, [editingLine, updateLine, createLine, success, error]);

  const handleDeleteLine = useCallback(async (lineId: string) => {
    try {
      await deleteLine(lineId);
      success('Product line deleted successfully!');
    } catch (err) {
      console.error('Error deleting product line:', err);
      error('Failed to delete product line: ' + (err as Error).message);
    }
  }, [deleteLine, success, error]);

  // User handlers
  const handleCreateUser = useCallback(() => {
    setEditingUser(undefined);
    setShowUserForm(true);
  }, []);

  const handleEditUser = useCallback((userToEdit: User) => {
    setEditingUser(userToEdit);
    setShowUserForm(true);
  }, []);

  const handleSaveUser = useCallback(async (userData: UserFormData) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, userData);
        success('User updated successfully!');
      } else {
        await createUser(userData);
        success('User created successfully!');
      }
      setShowUserForm(false);
      setEditingUser(undefined);
    } catch (err) {
      console.error('Error saving user:', err);
      error('Failed to save user: ' + (err as Error).message);
    }
  }, [editingUser, updateUser, createUser, success, error]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
      await deleteUser(userId);
      success('User deleted successfully!');
    } catch (err) {
      console.error('Error deleting user:', err);
      error('Failed to delete user: ' + (err as Error).message);
    }
  }, [deleteUser, success, error]);

  const handleUserStatusChange = useCallback(async (userId: string, status: UserStatus) => {
    try {
      await updateUserStatus(userId, status);
      const statusText = status === 'ACTIVE' ? 'activated' : 'deactivated';
      success(`User ${statusText} successfully!`);
    } catch (err) {
      console.error('Error updating user status:', err);
      error('Failed to update user status: ' + (err as Error).message);
    }
  }, [updateUserStatus, success, error]);

  const handleInviteUser = useCallback(() => {
    // For now, just show the user form - in a real app you might have a separate invite form
    setEditingUser(undefined);
    setShowUserForm(true);
  }, []);

  const handleUserSearch = useCallback((query: string) => {
    setUserSearchQuery(query);
  }, []);

  const handleUserFilterChange = useCallback((filters: { role?: string; status?: string }) => {
    setUserFilters(filters);
  }, []);

  if (showProductForm) {
    return (
      <AppLayout
        user={user}
        activeView={activeView}
        onViewChange={setActiveView}
        onLogout={onLogout}
      >
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-secondary">Loading form...</p>
            </div>
          </div>
        }>
          <ProductForm
            product={editingProduct}
            categories={categories}
            onSave={handleSaveProduct}
            onCancel={() => setShowProductForm(false)}
          />
        </Suspense>
      </AppLayout>
    );
  }

  if (showCategoryForm) {
    return (
      <AppLayout
        user={user}
        activeView={activeView}
        onViewChange={setActiveView}
        onLogout={onLogout}
      >
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-secondary">Loading form...</p>
            </div>
          </div>
        }>
          <CategoryForm
            category={editingCategory}
            onSave={handleSaveCategory}
            onCancel={() => setShowCategoryForm(false)}
          />
        </Suspense>
      </AppLayout>
    );
  }

  if (showLineForm) {
    return (
      <AppLayout
        user={user}
        activeView={activeView}
        onViewChange={setActiveView}
        onLogout={onLogout}
      >
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-secondary">Loading form...</p>
            </div>
          </div>
        }>
          <ProductLineForm
            line={editingLine}
            categories={categories}
            onSave={handleSaveLine}
            onCancel={() => setShowLineForm(false)}
          />
        </Suspense>
      </AppLayout>
    );
  }

  if (showUserForm) {
    return (
      <AppLayout
        user={user}
        activeView={activeView}
        onViewChange={setActiveView}
        onLogout={onLogout}
      >
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-secondary">Loading form...</p>
            </div>
          </div>
        }>
          <UserForm
            user={editingUser}
            currentUser={user}
            onSave={handleSaveUser}
            onCancel={() => setShowUserForm(false)}
          />
        </Suspense>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      user={user}
      activeView={activeView}
      onViewChange={setActiveView}
      onLogout={onLogout}
    >
      {activeView === 'categories' ? (
        can.viewCategories() ? (
          <CategoryList
            categories={categories}
            loading={categoriesLoading}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            onCreate={handleCreateCategory}
          />
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Access Denied</h3>
              <p className="text-secondary mb-6">You don't have permission to view category management.</p>
            </div>
          </div>
        )
      ) : activeView === 'lines' ? (
        can.viewLines() ? (
          <ProductLineList
            lines={lines}
            categories={categories}
            loading={linesLoading}
            onEdit={handleEditLine}
            onDelete={handleDeleteLine}
            onCreate={handleCreateLine}
          />
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Access Denied</h3>
              <p className="text-secondary mb-6">You don't have permission to view product line management.</p>
            </div>
          </div>
        )
      ) : activeView === 'users' ? (
        can.viewUsers() ? (
          <UserList
            users={users}
            loading={usersLoading}
            currentUser={user}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onCreate={handleCreateUser}
            onInvite={handleInviteUser}
            onStatusChange={handleUserStatusChange}
            onSearch={handleUserSearch}
            onFilterChange={handleUserFilterChange}
          />
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Access Denied</h3>
              <p className="text-secondary mb-6">You don't have permission to view user management.</p>
            </div>
          </div>
        )
      ) : activeView === 'profile' ? (
        <UserProfile 
          user={user}
          onUserUpdate={() => {}} // TODO: Update user in parent
        />
      ) : (
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 h-full">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <ProductTree
              categories={categories}
              onSelectProduct={setSelectedProductId}
              selectedProductId={selectedProductId}
              loading={categoriesLoading}
            />
          </div>
          
          <div className="lg:col-span-3 order-1 lg:order-2">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-1">Products</h2>
              <p className="text-secondary">
                {resultCount === totalCount 
                  ? `${totalCount} products` 
                  : `${resultCount} of ${totalCount} products`}
              </p>
            </div>
            <Button variant="primary" onClick={handleCreateProduct} className="lg:ml-4 shrink-0">
              Create Product
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <SearchInput
              value={filters.searchQuery}
              onChange={(value) => updateFilters({ searchQuery: value })}
              className="flex-1"
              placeholder="Search products, SKUs, descriptions..."
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex gap-2 flex-1">
                <FilterDropdown
                  label="Status"
                  options={filterOptions.statuses}
                  selectedValues={filters.statusFilters}
                  onChange={(values) => updateFilters({ statusFilters: values })}
                />
                <FilterDropdown
                  label="Category"
                  options={filterOptions.categories}
                  selectedValues={filters.categoryFilters}
                  onChange={(values) => updateFilters({ categoryFilters: values })}
                />
              </div>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} size="sm" className="shrink-0 sm:ml-2">
                  Clear
                </Button>
              )}
            </div>
          </div>
          
          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-card border border-default rounded-lg p-6 animate-pulse">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-3">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                      </div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-full"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-2/3"></div>
                      <div className="flex space-x-4 mb-4">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      </div>
                      <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded mb-4"></div>
                    </div>
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded ml-4"></div>
                  </div>
                  <div className="flex justify-between items-center mb-6 pt-4 border-t border-light">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 && !productsLoading ? (
            hasActiveFilters ? (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">No products found</h3>
                  <p className="text-secondary mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">No products yet</h3>
                  <p className="text-secondary mb-6">Get started by creating your first product to manage your inventory.</p>
                  <Button variant="primary" onClick={handleCreateProduct}>
                    Create Your First Product
                  </Button>
                </div>
              </div>
            ) : null
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onViewDetails={(id) => setSelectedProductId(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      )}
      <ToastContainer />
    </AppLayout>
  );
}

export default AppWrapper;