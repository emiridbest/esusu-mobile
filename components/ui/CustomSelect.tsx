import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder,
  className = ''
}) => {
  const showOptions = () => {
    Alert.alert(
      'Select Token',
      '',
      [
        ...options.map(opt => ({
          text: opt.label,
          onPress: () => onValueChange(opt.value)
        })),
        { text: 'Cancel', style: 'cancel' }
        ],
        { cancelable: true }
    );
  }
    return (
        <TouchableOpacity
        onPress={showOptions}
        className={`bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 ${className}`}
        >
        <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-700 dark:text-gray-300">
            {value ? options.find(opt => opt.value === value)?.label : placeholder}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">▼</Text>
        </View>
        </TouchableOpacity>
    );
}