import React from 'react';
import { View } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  fillClassName?: string;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  fillClassName = 'bg-blue-500',
  height = 8,
}) => {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View 
      className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${className}`}
      style={{ height }}
    >
      <View
        className={`h-full rounded-full transition-all duration-300 ease-out ${fillClassName}`}
        style={{ width: `${clampedProgress}%` }}
      />
    </View>
  );
};