import { memo, useState, useCallback } from 'react';
import type { User, UserRole, UserStatus } from '../../types';
import Button from '../common/Button';
import SearchInput from '../common/SearchInput';
import FilterDropdown from '../common/FilterDropdown';
import { usePermissions } from '../../hooks/usePermissions';
import { ROLE_DESCRIPTIONS } from '../../utils/permissions';

interface UserListProps {
  users: User[];
  loading: boolean;
  currentUser: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onCreate: () => void;
  onInvite: () => void;
  onStatusChange: (userId: string, status: UserStatus) => void;
  onSearch: (query: string) => void;
  onFilterChange: (filters: { role?: string; status?: string }) => void;
}

interface FilterOptions {
  roleFilters: string[];
  statusFilters: string[];
  searchQuery: string;
}

const UserStatusBadge = memo<{ status: UserStatus }>(({ status }) => {
  const statusConfig = {
    ACTIVE: { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700', label: 'Active', icon: '●' },
    INACTIVE: { color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600', label: 'Inactive', icon: '○' },
    SUSPENDED: { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700', label: 'Suspended', icon: '⚠' }
  };

  const config = statusConfig[status];
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <span className="text-xs">{config.icon}</span>
      {config.label}
    </span>
  );
});

const UserRoleBadge = memo<{ role: UserRole }>(({ role }) => {
  const roleConfig = ROLE_DESCRIPTIONS[role];
  const colorClasses = {
    red: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700'
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colorClasses[roleConfig.color as keyof typeof colorClasses]}`}>
      {roleConfig.title}
    </span>
  );
});

const UserCard = memo<{
  user: User;
  currentUser: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onStatusChange: (userId: string, status: UserStatus) => void;
}>(({ user, currentUser, onEdit, onDelete, onStatusChange }) => {
  const { can } = usePermissions(currentUser);
  
  const handleDelete = useCallback(() => {
    if (confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
      onDelete(user.id);
    }
  }, [user.id, user.name, onDelete]);

  const handleStatusToggle = useCallback(() => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    onStatusChange(user.id, newStatus);
  }, [user.id, user.status, onStatusChange]);

  const canManageThisUser = can.manageUser(user);
  const canEditUsers = can.editUsers();
  const canDeleteUsers = can.deleteUsers();

  return (
    <div className="bg-card rounded-lg border border-default p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover border border-default"
            />
          ) : (
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-primary truncate">
                {user.name}
                {user.id === currentUser.id && (
                  <span className="ml-2 text-xs text-muted">(You)</span>
                )}
              </h3>
              <p className="text-secondary text-sm truncate">{user.email}</p>
              {(user.department || user.jobTitle) && (
                <p className="text-muted text-sm mt-1">
                  {user.jobTitle && user.department 
                    ? `${user.jobTitle} • ${user.department}`
                    : user.jobTitle || user.department}
                </p>
              )}
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <UserRoleBadge role={user.role} />
              <UserStatusBadge status={user.status} />
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-muted mt-4 pt-4 border-t border-light">
            <div className="flex items-center space-x-4">
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              {user.lastLoginAt && (
                <span>Last login {new Date(user.lastLoginAt).toLocaleDateString()}</span>
              )}
            </div>
            {user.createdBy && (
              <span>Added by {user.createdBy.name}</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            {canEditUsers && canManageThisUser && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onEdit(user)}
              >
                Edit
              </Button>
            )}
            
            {canEditUsers && canManageThisUser && user.id !== currentUser.id && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStatusToggle}
                className={user.status === 'ACTIVE' ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}
              >
                {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
              </Button>
            )}
            
            {canDeleteUsers && canManageThisUser && user.id !== currentUser.id && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const UserList = memo<UserListProps>(({ 
  users, 
  loading, 
  currentUser,
  onEdit, 
  onDelete, 
  onCreate,
  onInvite,
  onStatusChange,
  onSearch,
  onFilterChange
}) => {
  const { can } = usePermissions(currentUser);
  const [filters, setFilters] = useState<FilterOptions>({
    roleFilters: [],
    statusFilters: [],
    searchQuery: ''
  });

  // Create filter options
  const roleOptions = Object.entries(ROLE_DESCRIPTIONS).map(([role, config]) => ({
    value: role,
    label: config.title,
    count: users.filter(user => user.role === role).length
  }));

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active', count: users.filter(user => user.status === 'ACTIVE').length },
    { value: 'INACTIVE', label: 'Inactive', count: users.filter(user => user.status === 'INACTIVE').length },
    { value: 'SUSPENDED', label: 'Suspended', count: users.filter(user => user.status === 'SUSPENDED').length }
  ];

  const updateFilters = useCallback((updates: Partial<FilterOptions>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    
    // Notify parent component
    onFilterChange({
      role: newFilters.roleFilters[0],
      status: newFilters.statusFilters[0]
    });
    
    if (updates.searchQuery !== undefined) {
      onSearch(newFilters.searchQuery);
    }
  }, [filters, onFilterChange, onSearch]);

  const clearFilters = useCallback(() => {
    const clearedFilters = {
      roleFilters: [],
      statusFilters: [],
      searchQuery: ''
    };
    setFilters(clearedFilters);
    onFilterChange({});
    onSearch('');
  }, [onFilterChange, onSearch]);

  const hasActiveFilters = filters.roleFilters.length > 0 || 
                          filters.statusFilters.length > 0 || 
                          filters.searchQuery.trim() !== '';

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-1">Team Members</h2>
            <p className="text-secondary">Loading users...</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              Invite User
            </Button>
            <Button variant="primary" disabled>
              Add User
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-card border border-default rounded-lg p-6 animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">Team Members</h2>
          <p className="text-secondary">
            {users.length === 1 ? '1 user' : `${users.length} users`}
          </p>
        </div>
        <div className="flex gap-2">
          {can.createUsers() && (
            <>
              <Button variant="outline" onClick={onInvite}>
                Invite User
              </Button>
              <Button variant="primary" onClick={onCreate}>
                Add User
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={filters.searchQuery}
          onChange={(value) => updateFilters({ searchQuery: value })}
          className="flex-1"
          placeholder="Search users by name, email, or department..."
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            <FilterDropdown
              label="Role"
              options={roleOptions}
              selectedValues={filters.roleFilters}
              onChange={(values) => updateFilters({ roleFilters: values })}
            />
            <FilterDropdown
              label="Status"
              options={statusOptions}
              selectedValues={filters.statusFilters}
              onChange={(values) => updateFilters({ statusFilters: values })}
            />
          </div>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} size="sm" className="shrink-0">
              Clear
            </Button>
          )}
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">No users found</h3>
            <p className="text-secondary mb-6">
              {hasActiveFilters 
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Get started by adding your first team member.'}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            ) : can.createUsers() && (
              <Button variant="primary" onClick={onCreate}>
                Add Your First User
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {users.map(user => (
            <UserCard
              key={user.id}
              user={user}
              currentUser={currentUser}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default UserList;