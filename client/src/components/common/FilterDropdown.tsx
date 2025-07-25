import React, { useState, useRef, useEffect } from 'react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "All"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  const displayText = selectedValues.length === 0 
    ? placeholder 
    : selectedValues.length === 1 
      ? options.find(opt => opt.value === selectedValues[0])?.label || placeholder
      : `${selectedValues.length} selected`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full bg-card border border-default rounded-lg px-3 py-2 text-left focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xs font-medium text-muted mr-2">{label}:</span>
            <span className="text-sm text-primary">{displayText}</span>
          </div>
          <svg
            className={`h-4 w-4 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-default rounded-lg shadow-lg">
          <div className="max-h-60 overflow-auto py-1">
            {selectedValues.length > 0 && (
              <>
                <button
                  onClick={clearAll}
                  className="w-full px-3 py-2 text-left text-sm text-muted hover-bg-soft flex items-center justify-between"
                >
                  Clear all
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <hr className="border-light" />
              </>
            )}
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionToggle(option.value)}
                className="w-full px-3 py-2 text-left text-sm hover-bg-soft flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 mr-3 rounded border-2 flex items-center justify-center ${
                    selectedValues.includes(option.value)
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-default'
                  }`}>
                    {selectedValues.includes(option.value) && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-primary">{option.label}</span>
                </div>
                {option.count !== undefined && (
                  <span className="text-muted text-xs">({option.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;