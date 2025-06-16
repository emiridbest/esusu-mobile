// src/components/ui/Select.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  label,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <View className={className}>
      {label && (
        <Text className="text-sm font-medium text-gray-800 dark:text-yellow-400 mb-2">
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        disabled={disabled}
        className={`
          flex-row items-center justify-between px-4 py-3 border-2 rounded-lg
          bg-white dark:bg-gray-800
          border-yellow-400/50 dark:border-yellow-400/30
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        <Text
          className={`text-base ${
            selectedOption 
              ? 'text-gray-900 dark:text-white' 
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons 
          name="chevron-down" 
          size={20} 
          color="#9CA3AF" 
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
      >
        <SafeAreaView className="flex-1 bg-black/50">
          <View className="flex-1 justify-end">
            <View className="bg-white dark:bg-gray-800 rounded-t-xl max-h-96">
              <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                  {label || 'Select Option'}
                </Text>
                <TouchableOpacity onPress={() => setIsOpen(false)}>
                  <Ionicons name="close" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelect(item.value)}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 ${
                      item.value === value ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                    }`}
                  >
                    <Text className="text-base text-gray-900 dark:text-white">
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};