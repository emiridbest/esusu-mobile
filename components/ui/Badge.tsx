import React from 'react';
import { Text, View } from 'react-native';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  className = '' 
}) => {
  const baseClasses = 'px-2 py-1 rounded-full';
  const variantClasses = variant === 'outline' 
    ? 'border border-gray-300 dark:border-gray-600 bg-transparent'
    : 'bg-gray-800 dark:bg-gray-200';
  
  const textClasses = variant === 'outline'
    ? 'text-gray-600 dark:text-gray-400'
    : 'text-white dark:text-gray-800';

  return (
    <View className={`${baseClasses} ${variantClasses} ${className}`}>
      <Text className={`text-xs font-medium ${textClasses}`}>
        {children}
      </Text>
    </View>
  );
};