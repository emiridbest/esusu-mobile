//import liraries
import { BalanceCard, BreaklockTab, DepositTab, WithdrawTab } from '@/components/minisafe';
import React from 'react';
import { SafeAreaView, View } from 'react-native';

// create a component
const Save = () => {
    return (
      <SafeAreaView className="bg-primary flex-1 px-10">
        <View className="flex-1 flex-col gap-5">
            <BalanceCard />
            <DepositTab />
            <WithdrawTab />
            <BreaklockTab />
        </View>
            
          </SafeAreaView>
    );
};


export default Save;
