import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  helperText, 
  className = '', 
  ...props 
}) => {
  const inputClasses = `
    block w-4/5 max-w-[380px] rounded-xl border-2 border-gray-200 dark:border-gray-700
    bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
    placeholder-gray-400 dark:placeholder-gray-500
    focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30
    transition-all duration-200 px-4 py-3 text-sm
    shadow-sm hover:shadow-md focus:shadow-lg
    ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100 dark:focus:ring-red-900/30' : ''}
    ${className}
  `;

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-primary mb-1">
          {label}
        </label>
      )}
      <input className={inputClasses} {...props} />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-muted">{helperText}</p>
      )}
    </div>
  );
};

export default Input;