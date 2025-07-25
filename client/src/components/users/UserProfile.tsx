import { useState, useCallback, memo } from 'react';
import type { User, UserProfileData } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import { userService } from '../../services';
import { useToast } from '../../hooks/useToast';

interface UserProfileProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UserProfile = memo<UserProfileProps>(({ user, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  const [profileData, setProfileData] = useState<UserProfileData>({
    name: user.name,
    email: user.email,
    department: user.department || '',
    jobTitle: user.jobTitle || '',
    bio: user.bio || '',
    phone: user.phone || '',
    location: user.location || ''
  });

  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Partial<UserProfileData & PasswordChangeData>>({});
  const { success, error } = useToast();

  const validateProfileForm = useCallback((): boolean => {
    const newErrors: Partial<UserProfileData> = {};

    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (profileData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (profileData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(profileData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [profileData]);

  const validatePasswordForm = useCallback((): boolean => {
    const newErrors: Partial<PasswordChangeData> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [passwordData]);

  const handleProfileSave = useCallback(async () => {
    if (!validateProfileForm()) return;

    setIsSubmitting(true);
    try {
      const updatedUser = await userService.updateProfile(profileData);
      onUserUpdate(updatedUser);
      setIsEditing(false);
      success('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      error('Failed to update profile: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }, [profileData, validateProfileForm, onUserUpdate, success, error]);

  const handlePasswordChange = useCallback(async () => {
    if (!validatePasswordForm()) return;

    setIsChangingPassword(true);
    try {
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      success('Password changed successfully!');
    } catch (err) {
      console.error('Error changing password:', err);
      error('Failed to change password: ' + (err as Error).message);
    } finally {
      setIsChangingPassword(false);
    }
  }, [passwordData, validatePasswordForm, success, error]);

  const handleAvatarUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      error('File size must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const { avatarUrl } = await userService.uploadAvatar(file);
      const updatedUser = { ...user, avatar: avatarUrl };
      onUserUpdate(updatedUser);
      success('Profile picture updated successfully!');
    } catch (err) {
      console.error('Error uploading avatar:', err);
      error('Failed to upload profile picture: ' + (err as Error).message);
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [user, onUserUpdate, success, error]);

  const handleInputChange = useCallback((field: keyof (UserProfileData & PasswordChangeData)) => (
    value: string
  ) => {
    if (field in profileData) {
      setProfileData(prev => ({ ...prev, [field]: value }));
    } else {
      setPasswordData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [profileData, errors]);

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: '👤' },
    { id: 'security' as const, label: 'Security', icon: '🔒' },
    { id: 'activity' as const, label: 'Activity', icon: '📊' }
  ];

  return (
    <div className="bg-card rounded-lg border border-default">
      {/* Header */}
      <div className="border-b border-light p-6">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="relative">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-default"
              />
            ) : (
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            {/* Upload overlay */}
            <label className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <span className="text-white text-xs">
                {isUploadingAvatar ? '...' : '📷'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={isUploadingAvatar}
              />
            </label>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-primary">{user.name}</h2>
            <p className="text-secondary">{user.email}</p>
            {(user.jobTitle || user.department) && (
              <p className="text-muted text-sm">
                {user.jobTitle && user.department 
                  ? `${user.jobTitle} • ${user.department}`
                  : user.jobTitle || user.department}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-light">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-secondary hover:text-primary hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-primary">Personal Information</h3>
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setProfileData({
                        name: user.name,
                        email: user.email,
                        department: user.department || '',
                        jobTitle: user.jobTitle || '',
                        bio: user.bio || '',
                        phone: user.phone || '',
                        location: user.location || ''
                      });
                      setErrors({});
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleProfileSave}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Full Name
                </label>
                <Input
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name')(e.target.value)}
                  error={errors.name}
                  disabled={!isEditing || isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Email Address
                </label>
                <Input
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email')(e.target.value)}
                  error={errors.email}
                  disabled={!isEditing || isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Job Title
                </label>
                <Input
                  value={profileData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle')(e.target.value)}
                  error={errors.jobTitle}
                  disabled={!isEditing || isSubmitting}
                  placeholder="e.g., Product Manager"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Department
                </label>
                <Input
                  value={profileData.department}
                  onChange={(e) => handleInputChange('department')(e.target.value)}
                  error={errors.department}
                  disabled={!isEditing || isSubmitting}
                  placeholder="e.g., Engineering"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Phone Number
                </label>
                <Input
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone')(e.target.value)}
                  error={errors.phone}
                  disabled={!isEditing || isSubmitting}
                  placeholder="e.g., +1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Location
                </label>
                <Input
                  value={profileData.location}
                  onChange={(e) => handleInputChange('location')(e.target.value)}
                  error={errors.location}
                  disabled={!isEditing || isSubmitting}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio')(e.target.value)}
                disabled={!isEditing || isSubmitting}
                rows={4}
                className="w-full px-3 py-2 border border-default rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-800"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-primary">Security Settings</h3>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
              <h4 className="text-md font-medium text-primary mb-4">Change Password</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword')(e.target.value)}
                    error={errors.currentPassword}
                    disabled={isChangingPassword}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handleInputChange('newPassword')(e.target.value)}
                    error={errors.newPassword}
                    disabled={isChangingPassword}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword')(e.target.value)}
                    error={errors.confirmPassword}
                    disabled={isChangingPassword}
                  />
                </div>

                <Button
                  variant="primary"
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
              <h4 className="text-md font-medium text-primary mb-2">Account Information</h4>
              <div className="space-y-2 text-sm text-secondary">
                <div className="flex justify-between">
                  <span>Role:</span>
                  <span className="font-medium">{user.role}</span>
                </div>
                <div className="flex justify-between">
                  <span>Account Created:</span>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                {user.lastLoginAt && (
                  <div className="flex justify-between">
                    <span>Last Login:</span>
                    <span>{new Date(user.lastLoginAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-primary">Recent Activity</h3>
            
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="text-lg font-medium text-primary mb-2">Activity Logging</h4>
              <p className="text-secondary mb-4">
                Activity logging will be available in the next update.
              </p>
              <p className="text-muted text-sm">
                This will show your recent actions, login history, and profile changes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default UserProfile;