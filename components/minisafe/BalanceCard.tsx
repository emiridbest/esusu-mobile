import { useMiniSafe } from '@/context/miniSafe/MiniSafeContext';
import { ethers } from "ethers";
import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Custom Components
import { Badge } from '../ui/Badge';
import { CustomSelect } from '../ui/CustomSelect';

interface TokenBalanceProps {
  label: string;
  balance: string | null;
  decimals: number;
  iconBg: string;
  iconColor: string;
  badge: string;
  formatBalance: (value: string) => string;
}

const TokenBalance: React.FC<TokenBalanceProps> = ({ 
  label, 
  balance, 
  decimals, 
  iconBg, 
  iconColor, 
  badge,
  formatBalance 
}) => (
  <View className="mb-4">
    <View className="flex-row items-center justify-between mb-1">
      <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label} Balance
      </Text>
      <Badge variant="outline" className="text-xs">
        {badge}
      </Badge>
    </View>
    <View className="flex-row items-center justify-between bg-gray-100 dark:bg-gray-800/50 rounded-lg p-3">
      <View className="flex-row items-center">
        <View className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center mr-2`}>
          <Text className={`text-sm font-bold ${iconColor}`}>$</Text>
        </View>
        <Text className="font-medium text-gray-900 dark:text-white">{label}</Text>
      </View>
      <Text className="text-xl font-bold text-gray-900 dark:text-white">
        {balance ? formatBalance(ethers.utils.formatUnits(balance || '0', decimals)) : '0.00'}
      </Text>
    </View>
  </View>
);

const BalanceCard: React.FC = () => {
  const {
    cusdBalance,
    usdcBalance,
    usdtBalance,
    tokenBalance,
    selectedToken,
    handleTokenChange,
    isLoading,
    getBalance,
    getTokenBalance,
    formatBalance,
    interestRate,
  } = useMiniSafe();

  const tokenOptions = [
    { label: 'CUSD', value: 'CUSD' },
    { label: 'USDC', value: 'USDC' },
    { label: 'USDT', value: 'USDT' },
  ];

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="mx-4 my-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
        {/* Header gradient line */}
        <View className="h-1 bg-gradient-to-r from-blue-500/70 via-blue-500/40 to-blue-500/10" />
        
        {/* Card Header */}
        <View className="px-6 py-4 pb-2">
          <View className="flex-row items-center mb-2">
            <Text className="text-2xl mr-2">💰</Text>
            <Text className="text-xl font-semibold text-gray-900 dark:text-white">
              My Savings
            </Text>
          </View>
          <Text className="text-gray-600 dark:text-gray-400">
            Manage your secured assets
          </Text>
        </View>

        {/* Card Content */}
        <View className="px-6 py-4">
          {isLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="mt-4 text-gray-600 dark:text-gray-400">
                Loading balances...
              </Text>
            </View>
          ) : (
            <>
              <TokenBalance
                label="CUSD"
                balance={cusdBalance}
                decimals={18}
                iconBg="bg-amber-100 dark:bg-amber-900/30"
                iconColor="text-amber-600 dark:text-amber-400"
                badge="Stablecoin"
                formatBalance={formatBalance}
              />
              
              <TokenBalance
                label="USDC"
                balance={usdcBalance}
                decimals={6}
                iconBg="bg-green-100 dark:bg-green-900/30"
                iconColor="text-green-600 dark:text-green-400"
                badge="Stablecoin"
                formatBalance={formatBalance}
              />
              
              <TokenBalance
                label="USDT"
                balance={usdtBalance}
                decimals={18}
                iconBg="bg-blue-100 dark:bg-blue-900/30"
                iconColor="text-blue-600 dark:text-blue-400"
                badge="Stablecoin"
                formatBalance={formatBalance}
              />

              {/* EST Tokens */}
              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    EST Tokens
                  </Text>
                  <Badge className="bg-black text-blue-500 text-xs">
                    Reward Token
                  </Badge>
                </View>
                <View className="flex-row items-center justify-between bg-gradient-to-r from-blue-500/10 to-transparent rounded-lg p-3">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-2">
                      <Text className="text-sm font-bold text-blue-500">E</Text>
                    </View>
                    <Text className="font-medium text-gray-900 dark:text-white">EST</Text>
                  </View>
                  <Text className="text-xl font-bold text-gray-900 dark:text-white">
                    {tokenBalance}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Token Selection */}
          <View className="pt-2 mb-4">
            <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Select token
            </Text>
            <CustomSelect
              value={selectedToken}
              onValueChange={handleTokenChange}
              options={tokenOptions}
              placeholder="Select token"
            />
          </View>

          {/* Interest Rate Alert */}
          {usdcBalance && parseFloat(ethers.utils.formatUnits(usdcBalance || '0', 6)) > 0 && (
            <View className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 flex-row">
              <Text className="text-blue-500 mr-2 text-lg">ℹ️</Text>
              <Text className="text-sm text-gray-600 dark:text-gray-300 flex-1">
                Your assets are earning approximately {interestRate}% APY in EST tokens
              </Text>
            </View>
          )}
        </View>

        {/* Card Footer */}
        <View className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-xs text-gray-500 mr-1">🕒</Text>
            <Text className="text-xs text-gray-500">Updated just now</Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center px-2 py-1 rounded"
            onPress={() => {
              getBalance();
              getTokenBalance();
            }}
          >
            <Text className="text-xs text-gray-500 mr-1">🔄</Text>
            <Text className="text-xs text-gray-500">Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default BalanceCard;