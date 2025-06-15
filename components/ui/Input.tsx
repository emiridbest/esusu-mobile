// src/components/ui/Input.tsx
import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  description?: string;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  description,
  className = '',
  ...props
}) => {
  return (
    <View className={`space-y-2 ${className}`}>
      {label && (
        <Text className="text-sm font-medium text-gray-800 dark:text-yellow-400">
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        className={`
          px-4 py-3 border-2 rounded-lg text-base
          bg-white dark:bg-gray-800
          border-yellow-400/50 dark:border-yellow-400/30
          text-gray-900 dark:text-white
          ${error ? 'border-red-500' : ''}
        `}
        {...props}
      />
      {description && (
        <Text className="text-xs text-gray-600 dark:text-gray-300">
          {description}
        </Text>
      )}
      {error && (
        <Text className="text-xs text-red-600 dark:text-red-400">
          {error}
        </Text>
      )}
    </View>
  );
};