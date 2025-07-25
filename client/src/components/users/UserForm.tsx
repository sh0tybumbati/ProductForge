import { useState, useCallback, memo } from 'react';
import type { User, UserFormData, UserRole } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { ROLE_DESCRIPTIONS } from '../../utils/permissions';
import { usePermissions } from '../../hooks/usePermissions';

interface UserFormProps {
  user?: User;
  currentUser: User;
  onSave: (userData: UserFormData) => void;
  onCancel: () => void;
}

const UserForm = memo<UserFormProps>(({ user, currentUser, onSave, onCancel }) => {
  const { can } = usePermissions(currentUser);
  
  const [formData, setFormData] = useState<UserFormData>({
    email: user?.email || '',
    name: user?.name || '',
    role: user?.role || 'VIEWER',
    status: user?.status || 'ACTIVE',
    department: user?.department || '',
    jobTitle: user?.jobTitle || '',
  });

  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<UserFormData> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Role is required' as any;
    }

    // Status validation
    if (!formData.status) {
      newErrors.status = 'Status is required' as any;
    }

    // Optional field validation
    if (formData.department && formData.department.length > 50) {
      newErrors.department = 'Department must be less than 50 characters';
    }

    if (formData.jobTitle && formData.jobTitle.length > 50) {
      newErrors.jobTitle = 'Job title must be less than 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSave]);

  const handleInputChange = useCallback((field: keyof UserFormData) => (
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Prepare options for select components
  const roleOptions = Object.entries(ROLE_DESCRIPTIONS).map(([role, config]) => ({
    value: role,
    label: config.title
  }));

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'SUSPENDED', label: 'Suspended' }
  ];

  // Check permissions
  const canManageRoles = can.manageUserRoles();
  const canEditUser = user ? can.manageUser(user) : can.createUsers();

  if (!canEditUser) {
    return (
      <div className="bg-card rounded-lg border border-default p-8 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-primary mb-2">Access Denied</h3>
        <p className="text-secondary mb-6">
          You don't have permission to {user ? 'edit this user' : 'create new users'}.
        </p>
        <Button variant="outline" onClick={onCancel}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-default">
      <div className="border-b border-light p-6">
        <h2 className="text-xl font-semibold text-primary">
          {user ? `Edit User: ${user.name}` : 'Add New User'}
        </h2>
        <p className="text-secondary text-sm mt-1">
          {user 
            ? 'Update the user information below' 
            : 'Fill in the details to create a new user account'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-primary mb-4">Personal Information</h3>
              
              {/* Full Name */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-primary mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name')(e.target.value)}
                  error={errors.name}
                  placeholder="e.g., John Smith"
                  maxLength={50}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted mt-1">
                  {formData.name.length}/50 characters
                </p>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email')(e.target.value)}
                  error={errors.email}
                  placeholder="e.g., john.smith@company.com"
                  disabled={isSubmitting}
                />
              </div>

              {/* Department */}
              <div className="mb-4">
                <label htmlFor="department" className="block text-sm font-medium text-primary mb-2">
                  Department <span className="text-muted">(Optional)</span>
                </label>
                <Input
                  id="department"
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department')(e.target.value)}
                  error={errors.department}
                  placeholder="e.g., Marketing, Engineering, Sales"
                  maxLength={50}
                  disabled={isSubmitting}
                />
              </div>

              {/* Job Title */}
              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-primary mb-2">
                  Job Title <span className="text-muted">(Optional)</span>
                </label>
                <Input
                  id="jobTitle"
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle')(e.target.value)}
                  error={errors.jobTitle}
                  placeholder="e.g., Product Manager, Developer, Designer"
                  maxLength={50}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-primary mb-4">Account Settings</h3>

              {/* Role */}
              <div className="mb-4">
                <label htmlFor="role" className="block text-sm font-medium text-primary mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <Select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role')(e.target.value)}
                  options={roleOptions}
                  error={errors.role}
                  disabled={isSubmitting || !canManageRoles}
                />
                {formData.role && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-muted">
                      <strong>{ROLE_DESCRIPTIONS[formData.role as UserRole].title}:</strong> {ROLE_DESCRIPTIONS[formData.role as UserRole].description}
                    </p>
                  </div>
                )}
                {!canManageRoles && (
                  <p className="text-xs text-muted mt-1">
                    You don't have permission to change user roles
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-primary mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <Select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status')(e.target.value)}
                  options={statusOptions}
                  error={errors.status}
                  disabled={isSubmitting || (user?.id === currentUser.id)}
                />
                {user?.id === currentUser.id && (
                  <p className="text-xs text-muted mt-1">
                    You cannot change your own account status
                  </p>
                )}
              </div>

              {/* Account Information */}
              {user && (
                <div className="border border-light rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                  <h4 className="text-sm font-medium text-primary mb-3">Account Information</h4>
                  <div className="space-y-2 text-xs text-muted">
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    {user.lastLoginAt && (
                      <div className="flex justify-between">
                        <span>Last Login:</span>
                        <span>{new Date(user.lastLoginAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {user.createdBy && (
                      <div className="flex justify-between">
                        <span>Added By:</span>
                        <span>{user.createdBy.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-8 pt-6 border-t border-light">
          <h4 className="text-sm font-medium text-primary mb-3">Preview</h4>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
              <div>
                <div className="font-medium text-primary">
                  {formData.name || 'User Name'}
                </div>
                <div className="text-sm text-secondary">
                  {formData.email || 'user@email.com'}
                </div>
                {(formData.jobTitle || formData.department) && (
                  <div className="text-xs text-muted">
                    {formData.jobTitle && formData.department 
                      ? `${formData.jobTitle} • ${formData.department}`
                      : formData.jobTitle || formData.department}
                  </div>
                )}
              </div>
              <div className="flex space-x-2 ml-auto">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  ROLE_DESCRIPTIONS[formData.role as UserRole]?.color === 'red' 
                    ? 'bg-red-100 text-red-800'
                    : ROLE_DESCRIPTIONS[formData.role as UserRole]?.color === 'indigo'
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {ROLE_DESCRIPTIONS[formData.role as UserRole]?.title || formData.role}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  formData.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800'
                    : formData.status === 'SUSPENDED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {formData.status.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-light">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{user ? 'Updating...' : 'Creating...'}</span>
              </div>
            ) : (
              user ? 'Update User' : 'Create User'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
});

export default UserForm;