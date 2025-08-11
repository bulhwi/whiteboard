import React from 'react';

interface ColorButtonProps {
  color: string;
  selected?: boolean;
  onClick?: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ColorButton: React.FC<ColorButtonProps> = ({ 
  color, 
  selected = false, 
  onClick, 
  title,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <button
      onClick={onClick}
      title={title}
      className={`${sizeClasses[size]} rounded-full border-2 transition-all hover:scale-110 ${
        selected 
          ? 'border-blue-500 shadow-md ring-2 ring-blue-200' 
          : 'border-gray-300 hover:border-gray-400'
      }`}
      style={{ backgroundColor: color }}
    />
  );
};

export default ColorButton;