// src/components/ui/Button.tsx
import React from 'react';
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    TouchableOpacityProps
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  children?: React.ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  children,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'flex-row items-center justify-center rounded-lg';
  
  const variantClasses = {
    primary: 'bg-yellow-400 shadow-lg shadow-yellow-400/30',
    secondary: 'bg-gray-200 dark:bg-gray-700',
    outline: 'border-2 border-yellow-400 bg-transparent',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        isDisabled ? 'opacity-50' : ''
      } ${className}`}
      activeOpacity={0.7}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#000' : '#666'}
          className="mr-2"
        />
      )}
      {children || (
        <Text
          className={`font-medium ${textSizeClasses[size]} ${
            variant === 'primary' ? 'text-black' : 'text-gray-800 dark:text-white'
          }`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};