import { useMiniSafe } from '@/context/miniSafe/MiniSafeContext';
import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface InfoStepProps {
  number: string;
  text: string;
}

const InfoStep: React.FC<InfoStepProps> = ({ number, text }) => (
  <View className="flex-row items-start mb-3">
    <View className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 mt-0.5">
      <Text className="text-xs font-medium text-blue-500">{number}</Text>
    </View>
    <Text className="flex-1 text-sm text-gray-600 dark:text-gray-300 leading-5">
      {text}
    </Text>
  </View>
);

const DepositTab: React.FC = () => {
  const {
    depositAmount,
    setDepositAmount,
    selectedToken,
    isApproved,
    isApproving,
    isWaitingTx,
    approveSpend,
    handleDeposit,
  } = useMiniSafe();

  const needsApproval = selectedToken === 'cUSD' || selectedToken === 'G$';

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="p-4 space-y-6">
        {/* Deposit Section */}
        <View className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <View className="flex-row items-center mb-4">
            <Text className="text-xl mr-2">⬇️</Text>
            <Text className="text-lg font-medium text-gray-900 dark:text-white">
              Deposit {selectedToken}
            </Text>
          </View>
          
          <Text className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-5">
            Deposited assets are locked over time. You will earn EST tokens as rewards during this period.
          </Text>
          
          {/* Amount Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount
            </Text>
            <TextInput
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base"
              value={depositAmount?.toString() || ''}
              onChangeText={(text) => setDepositAmount(Number(text))}
              placeholder={`Enter ${selectedToken} amount`}
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
            {selectedToken === 'cUSD' && (
              <Text className="text-xs text-gray-500 mt-1">
                Approve amount before depositing
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View className={`${needsApproval ? 'flex-row space-x-3' : ''}`}>
            {needsApproval ? (
              <>
                {/* Approve Button */}
                <TouchableOpacity
                  className={`flex-1 px-4 py-3 rounded-lg flex-row items-center justify-center ${
                    isApproved
                      ? 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                      : 'bg-blue-600'
                  } ${(isApproved || isApproving) ? 'opacity-50' : ''}`}
                  onPress={approveSpend}
                  disabled={isApproved || isApproving}
                >
                  {isApproving && (
                    <ActivityIndicator size="small" color={isApproved ? "#6B7280" : "#FFFFFF"} className="mr-2" />
                  )}
                  {isApproved && !isApproving && (
                    <Text className="text-green-500 mr-2">✓</Text>
                  )}
                  <Text className={`font-medium ${
                    isApproved ? 'text-gray-700 dark:text-gray-300' : 'text-white'
                  }`}>
                    {isApproved ? 'Approved' : 'Approve'}
                  </Text>
                </TouchableOpacity>

                {/* Deposit Button */}
                <TouchableOpacity
                  className={`flex-1 px-4 py-3 rounded-lg flex-row items-center justify-center bg-blue-600 ${
                    (!isApproved || isWaitingTx || depositAmount <= 0) ? 'opacity-50' : ''
                  }`}
                  onPress={handleDeposit}
                  disabled={!isApproved || isWaitingTx || depositAmount <= 0}
                >
                  {isWaitingTx && (
                    <ActivityIndicator size="small" color="#FFFFFF" className="mr-2" />
                  )}
                  <Text className="font-medium text-white">Deposit</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* Single Deposit Button */
              <TouchableOpacity
                className={`px-4 py-3 rounded-lg flex-row items-center justify-center bg-blue-600 ${
                  (isWaitingTx || depositAmount <= 0) ? 'opacity-50' : ''
                }`}
                onPress={handleDeposit}
                disabled={isWaitingTx || depositAmount <= 0}
              >
                {isWaitingTx && (
                  <ActivityIndicator size="small" color="#FFFFFF" className="mr-2" />
                )}
                <Text className="font-medium text-white">Deposit {selectedToken}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Information Section */}
        <View className="bg-blue-500/5 rounded-xl p-4">
          <View className="flex-row items-center mb-4">
            <Text className="text-xl mr-2">ℹ️</Text>
            <Text className="text-base font-medium text-gray-900 dark:text-white">
              What happens when you deposit?
            </Text>
          </View>
          
          <View>
            <InfoStep
              number="1"
              text="Your assets are locked in a smart contract"
            />
            <InfoStep
              number="2"
              text="Withdrawal window is between 28th to 30th day monthly"
            />
            <InfoStep
              number="3"
              text="You earn EST tokens proportional to your deposit amount"
            />
            <InfoStep
              number="4"
              text="EST tokens can be used to break the timelock early if needed"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default DepositTab;