import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import AuthLayout from './AuthLayout';
import { authService } from '../../services';
import { useToast } from '../../hooks/useToast';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onLoginSuccess?: (user: any) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { success, error } = useToast();

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      const result = await authService.login(formData);
      success('Login successful!');
      
      if (onLoginSuccess) {
        onLoginSuccess(result.user);
      }
      
      // Navigate to main app
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      error('Login failed: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onLoginSuccess, navigate, success, error]);


  const handleInputChange = useCallback((field: keyof LoginFormData) => (
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your ProductForge account"
    >
      <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email')(e.target.value)}
            error={errors.email}
            placeholder="Enter your email"
            disabled={isSubmitting}
            autoComplete="email"
            autoFocus
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-primary mb-2">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password')(e.target.value)}
            error={errors.password}
            placeholder="Enter your password"
            disabled={isSubmitting}
            autoComplete="current-password"
          />
        </div>

        {/* Remember me */}
        <div className="flex flex-col items-center space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-600 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-secondary">Remember me</span>
          </label>
          
          {/* Forgot password */}
          <button
            type="button"
            className="text-sm text-indigo-600 hover:text-indigo-500"
            onClick={() => {
              // TODO: Implement forgot password
              error('Forgot password feature coming soon!');
            }}
          >
            Forgot password?
          </button>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          className="w-4/5 max-w-[380px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            'Sign In'
          )}
        </Button>


        {/* Sign up link */}
        <div className="text-center pt-4 border-t border-light">
          <p className="text-sm text-secondary">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginForm;