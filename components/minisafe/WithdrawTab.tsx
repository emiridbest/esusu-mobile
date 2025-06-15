import { useMiniSafe } from '@/context/miniSafe/MiniSafeContext';
import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ProgressBar } from '../ui/ProgressBar';

const WithdrawTab: React.FC = () => {
  const {
    selectedToken,
    isWaitingTx,
    handleWithdraw,
  } = useMiniSafe();

  // Get the current date to determine if withdrawal is allowed
  const currentDay = new Date().getDate();
  const isWithdrawalPeriod = currentDay >= 28 && currentDay <= 31;
  const daysLeft = isWithdrawalPeriod ? 0 : currentDay > 31 ? 28 : Math.max(28 - currentDay, 0);
  const progressValue = isWithdrawalPeriod ? 100 : Math.min(Math.max(((currentDay / 28) * 100), 0), 100);

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="p-4 space-y-6">
        {/* Withdraw Section */}
        <View className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <View className="flex-row items-center mb-4">
            <Text className="text-xl mr-2">⬆️</Text>
            <Text className="text-lg font-medium text-gray-900 dark:text-white">
              Withdraw {selectedToken}
            </Text>
          </View>
          
          {/* Progress Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Withdrawal period
              </Text>
              {isWithdrawalPeriod ? (
                <Text className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Available now!
                </Text>
              ) : (
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  {daysLeft} {daysLeft === 1 ? 'day' : 'days'} until available
                </Text>
              )}
            </View>
            
            <ProgressBar
              progress={progressValue}
              className={isWithdrawalPeriod ? 'bg-green-100 dark:bg-green-900/30' : ''}
              fillClassName={isWithdrawalPeriod ? 'bg-green-500' : 'bg-blue-500'}
            />
            
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Withdrawals are only available between the 28th-31st of each month
            </Text>
          </View>

          {/* Withdraw Button */}
          <TouchableOpacity
            className={`px-4 py-3 rounded-lg flex-row items-center justify-center ${
              isWithdrawalPeriod ? 'bg-blue-600' : 'bg-gray-400'
            } ${(!isWithdrawalPeriod || isWaitingTx) ? 'opacity-50' : ''}`}
            onPress={handleWithdraw}
            disabled={!isWithdrawalPeriod || isWaitingTx}
          >
            {isWaitingTx && (
              <ActivityIndicator size="small" color="#FFFFFF" className="mr-2" />
            )}
            <Text className="font-medium text-white">
              {isWithdrawalPeriod ? 'Withdraw All' : 'Locked'}
            </Text>
          </TouchableOpacity>

          {/* Warning Message */}
          {!isWithdrawalPeriod && (
            <View className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <View className="flex-row items-start">
                <Text className="text-amber-600 dark:text-amber-400 mr-2 text-base">⚠️</Text>
                <Text className="flex-1 text-sm text-gray-600 dark:text-gray-300 leading-5">
                  Your funds are time-locked until the 28th of the month. Use the{' '}
                  <Text className="font-semibold">Break Lock</Text> tab if you need to withdraw early 
                  (requires EST tokens).
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Information Alert */}
        <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <View className="flex-row items-start">
            <Text className="text-blue-600 dark:text-blue-400 mr-2 text-base">ℹ️</Text>
            <Text className="flex-1 text-sm text-gray-600 dark:text-gray-300 leading-5">
              When you withdraw after the lock period, you will receive your original deposit 
              plus any earned rewards.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default WithdrawTab;