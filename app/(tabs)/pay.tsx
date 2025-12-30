//import liraries
import MobileDataForm from '@/components/utilityBills/MobileDataForm';
import { icons } from '@/constants/icons';
import React from 'react';
import { Image, SafeAreaView, Text, View } from 'react-native';
// create a component
const Pay = () => {
    return (
      <SafeAreaView className="bg-primary flex-1 px-10">
            <View className="flex justify-center items-center flex-1 flex-col gap-5">
              <Image source={icons.person} className="size-10" tintColor="#fff" />
              <Text className="text-gray-500 text-base">Profile</Text>
                <Text className="text-gray-500 text-base">Pay Bills</Text>
                <MobileDataForm />
                
            </View>
          </SafeAreaView>
    );
};

// define your styles

//make this component available to the app
export default Pay;
