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

const BreakLockTab: React.FC = () => {
  const {
    selectedToken,
    tokenBalance,
    isWaitingTx,
    handleBreakLock,
  } = useMiniSafe();

  // EST tokens required to break lock
  const requiredEstTokens = 15;
  const hasEnoughTokens = parseInt(tokenBalance) >= requiredEstTokens;
  const tokenPercentage = Math.min((parseInt(tokenBalance) / requiredEstTokens) * 100, 100);

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="p-4 space-y-6">
        {/* Break Lock Section */}
        <View className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <View className="flex-row items-center mb-4">
            <Text className="text-xl mr-2">🔓</Text>
            <Text className="text-lg font-medium text-gray-900 dark:text-white">
              Break Timelock
            </Text>
          </View>
          
          <Text className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-5">
            <Text className="font-semibold">Need to withdraw before the 28th?</Text> Use your EST tokens 
            to break the timelock and withdraw your funds immediately. This will consume your EST tokens 
            but bypass the monthly withdrawal restriction.
          </Text>

          {/* EST Token Requirements */}
          <View className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
            <View className="flex-row items-start">
              <Text className="text-amber-500 mr-3 mt-1 text-base">🔒</Text>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Required EST Tokens
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                  You need {requiredEstTokens} EST tokens to break this timelock
                </Text>
                
                {/* Balance Display */}
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-xs text-gray-600 dark:text-gray-400">Your balance:</Text>
                  <Text className="text-xs font-medium text-gray-900 dark:text-white">
                    {tokenBalance} EST
                  </Text>
                </View>
                
                {/* Progress Bar */}
                <ProgressBar
                  progress={tokenPercentage}
                  className="h-1.5 mb-2"
                  fillClassName={hasEnoughTokens ? 'bg-green-500' : 'bg-amber-500'}
                />
                
                {/* Status Message */}
                <View className="flex-row items-center">
                  {hasEnoughTokens ? (
                    <>
                      <Text className="text-green-500 mr-1">✓</Text>
                      <Text className="text-xs text-green-600 dark:text-green-400">
                        You have enough EST tokens
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text className="text-amber-500 mr-1">⚠️</Text>
                      <Text className="text-xs text-amber-600 dark:text-amber-400">
                        You need {requiredEstTokens - parseInt(tokenBalance)} more EST tokens
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Break Lock Button */}
          <TouchableOpacity
            className={`px-4 py-3 rounded-lg flex-row items-center justify-center bg-red-600 ${
              (!hasEnoughTokens || isWaitingTx) ? 'opacity-50' : ''
            }`}
            onPress={handleBreakLock}
            disabled={!hasEnoughTokens || isWaitingTx}
          >
            {isWaitingTx && (
              <ActivityIndicator size="small" color="#FFFFFF" className="mr-2" />
            )}
            <Text className="font-medium text-white">Break Lock & Withdraw</Text>
          </TouchableOpacity>
        </View>

        {/* How it Works Section */}
        <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
          <Text className="text-base font-medium text-gray-900 dark:text-white mb-3">
            How it works
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-5">
            Breaking the timelock early will consume your EST tokens. You will receive your 
            original deposit plus any earned rewards.
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 leading-4">
            Note: EST tokens are non-transferable and can only be used to break timelocks.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default BreakLockTab;