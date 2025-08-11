import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'secondary', 
  size = 'md',
  active = false,
  className = '',
  disabled = false
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: active 
      ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:ring-blue-500'
      : 'bg-blue-500 text-white shadow-sm hover:bg-blue-600 focus:ring-blue-500',
    secondary: active
      ? 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    danger: active
      ? 'bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-500'
      : 'bg-red-500 text-white shadow-sm hover:bg-red-600 focus:ring-red-500'
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;