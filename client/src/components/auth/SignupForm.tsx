import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import AuthLayout from './AuthLayout';
import { authService } from '../../services';
import { useToast } from '../../hooks/useToast';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface SignupFormProps {
  onSignupSuccess?: (user: any) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignupSuccess }) => {
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Partial<SignupFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const navigate = useNavigate();
  const { success, error } = useToast();

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<SignupFormData> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!acceptedTerms) {
      error('Please accept the terms and conditions to continue');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      success('Account created successfully! Welcome to ProductForge!');
      
      if (onSignupSuccess) {
        onSignupSuccess(result.user);
      }
      
      // Navigate to main app
      navigate('/');
    } catch (err) {
      console.error('Signup error:', err);
      error('Registration failed: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, acceptedTerms, onSignupSuccess, navigate, success, error]);

  const handleInputChange = useCallback((field: keyof SignupFormData) => (
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const getPasswordStrength = useCallback((password: string): { strength: 'weak' | 'medium' | 'strong'; label: string; color: string } => {
    if (password.length === 0) return { strength: 'weak', label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score < 3) return { strength: 'weak', label: 'Weak', color: 'text-red-600' };
    if (score < 5) return { strength: 'medium', label: 'Medium', color: 'text-yellow-600' };
    return { strength: 'strong', label: 'Strong', color: 'text-green-600' };
  }, []);

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Start your journey with ProductForge"
    >
      <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-primary mb-2">
            Full Name
          </label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name')(e.target.value)}
            error={errors.name}
            placeholder="Enter your full name"
            disabled={isSubmitting}
            autoComplete="name"
            autoFocus
          />
        </div>

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
            placeholder="Enter your email address"
            disabled={isSubmitting}
            autoComplete="email"
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
            placeholder="Create a strong password"
            disabled={isSubmitting}
            autoComplete="new-password"
          />
        </div>

        {/* Password strength indicator */}
        {formData.password && (
          <div className="flex flex-col items-center space-y-2 w-4/5 max-w-[380px]">
            <div className="w-full max-w-[200px] bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  passwordStrength.strength === 'weak' ? 'bg-red-500 w-1/3' :
                  passwordStrength.strength === 'medium' ? 'bg-yellow-500 w-2/3' :
                  'bg-green-500 w-full'
                }`}
              />
            </div>
            <span className={`text-xs font-medium ${passwordStrength.color}`}>
              {passwordStrength.label}
            </span>
            <p className="text-xs text-muted text-center">
              Use 8+ characters with uppercase, lowercase, and numbers
            </p>
          </div>
        )}

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary mb-2">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword')(e.target.value)}
            error={errors.confirmPassword}
            placeholder="Confirm your password"
            disabled={isSubmitting}
            autoComplete="new-password"
          />
        </div>

        {/* Terms and conditions */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-start space-x-3">
            <input
              id="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-600 border-gray-300 rounded mt-1"
            />
            <label htmlFor="terms" className="text-sm text-secondary leading-5">
              I agree to the
            </label>
          </div>
          <div className="text-sm text-center">
            <button
              type="button"
              className="text-indigo-600 hover:text-indigo-500"
              onClick={() => {
                // TODO: Implement terms modal
                error('Terms and conditions modal coming soon!');
              }}
            >
              Terms and Conditions
            </button>
            {' '}and{' '}
            <button
              type="button"
              className="text-indigo-600 hover:text-indigo-500"
              onClick={() => {
                // TODO: Implement privacy modal
                error('Privacy policy modal coming soon!');
              }}
            >
              Privacy Policy
            </button>
          </div>
        </div>

        {/* Extra spacing before submit button */}
        <div></div>

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          className="w-4/5 max-w-[380px]"
          disabled={isSubmitting || !acceptedTerms}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating account...</span>
            </div>
          ) : (
            'Create Account'
          )}
        </Button>

        {/* Sign in link */}
        <div className="text-center pt-4 border-t border-light">
          <p className="text-sm text-secondary">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignupForm;