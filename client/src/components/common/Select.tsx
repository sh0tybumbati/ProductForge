import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({ 
  label, 
  error, 
  helperText, 
  options,
  placeholder,
  className = '', 
  ...props 
}) => {
  const selectClasses = `
    block w-full rounded-lg border border-gray-300 dark:border-gray-600 
    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
    focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
    transition-all duration-200 px-3 py-2
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
    ${className}
  `;

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-primary mb-1">
          {label}
        </label>
      )}
      <select className={selectClasses} {...props}>
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-muted">{helperText}</p>
      )}
    </div>
  );
};

export default Select;