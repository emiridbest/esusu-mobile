import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { z } from 'zod';

import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import CountrySelector from './CountrySelector';

import { useUtility } from '../../context/utilityProvider/UtilityContext';
import { TOKENS } from '../../context/utilityProvider/tokens';
import { useBalance } from '../../context/utilityProvider/useBalance';
import {
  fetchDataPlans,
  fetchMobileOperators,
  verifyAndSwitchProvider,
  type DataPlan,
  type NetworkOperator
} from '../../services/utility/utilityServices';

const formSchema = z.object({
  country: z.string({
    required_error: "Please select a country.",
  }),
  phoneNumber: z.string()
    .min(10, { message: "Phone number must be at least 10 digits." })
    .refine(val => /^\d+$/.test(val.replace(/[\s-]/g, '')), {
      message: "Phone number should contain only digits, spaces, or hyphens."
    }),
  network: z.string({
    required_error: "Please select a network provider.",
  }),
  plan: z.string({
    required_error: "Please select a data plan.",
  }),
  paymentToken: z.string({
    required_error: "Please select a payment token.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  })
});

type FormData = z.infer<typeof formSchema>;

export default function MobileDataForm() {
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [networks, setNetworks] = useState<NetworkOperator[]>([]);
  const [availablePlans, setAvailablePlans] = useState<DataPlan[]>([]);
  const [selectedToken, setSelectedToken] = useState<string | undefined>(undefined);
  
  const { checkTokenBalance } = useBalance();
  const {

    isProcessing,
    setIsProcessing,
    handleTransaction
  } = useUtility();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: "",
      phoneNumber: "",
      network: "",
      plan: "",
      email: "",
      paymentToken: "cusd",
    },
  });

  const watchCountry = watch("country");
  const watchNetwork = watch("network");
  const watchPlan = watch("plan");
  const watchPaymentToken = watch("paymentToken");

  // Convert TOKENS to select options
  const tokenOptions = TOKENS.map(token => ({
    label: token.name,
    value: token.id,
  }));

  // Fetch network providers when country changes
  useEffect(() => {
    const getNetworks = async () => {
      if (watchCountry) {
        setIsLoading(true);
        setValue("network", "");
        setValue("plan", "");

        try {
          const operators = await fetchMobileOperators(watchCountry);
          setNetworks(operators);
        } catch (error) {
          console.error("Error fetching mobile operators:", error);
          Alert.alert("Error", "Failed to load network providers. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    getNetworks();
  }, [watchCountry, setValue]);

  // Fetch data plans when network changes
  useEffect(() => {
    const getDataPlans = async () => {
      if (watchNetwork && watchCountry) {
        setIsLoading(true);
        setValue("plan", "");

        try {
          const plans = await fetchDataPlans(watchNetwork, watchCountry);
          setAvailablePlans(plans);
        } catch (error) {
          console.error("Error fetching data plans:", error);
          Alert.alert("Error", "Failed to load data plans. Please try again.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setAvailablePlans([]);
      }
    };

    getDataPlans();
  }, [watchNetwork, watchCountry, setValue]);

  // Update price when plan changes
  useEffect(() => {
    if (watchPlan) {
      const selectedPlan = availablePlans.find(plan => plan.id === watchPlan);
      if (selectedPlan) {
        const priceValue = selectedPlan.price.replace(/[^0-9.]/g, '');
        setSelectedPrice(Number(priceValue));
      } else {
        setSelectedPrice(0);
      }
    } else {
      setSelectedPrice(0);
    }
  }, [watchPlan, availablePlans]);

  useEffect(() => {
    setSelectedToken(watchPaymentToken);
  }, [watchPaymentToken]);

  const networkOptions = networks.map(network => ({
    label: network.name,
    value: network.id,
  }));

  const planOptions = availablePlans.map(plan => ({
    label: `${plan.name} - ${plan.price}`,
    value: plan.id,
  }));

  const onSubmit = async (values: FormData) => {
    setIsProcessing(true);
    
    try {
      const phoneNumber = values.phoneNumber;
      const country = values.country;
      const provider = values.network;
      
      if (!phoneNumber || !country || !provider || !selectedToken) {
        Alert.alert("Error", "Please ensure all fields are filled out correctly.");
        return;
      }



      const verificationResult = await verifyAndSwitchProvider(phoneNumber, provider, country);

      if (verificationResult.verified) {
        
        if (verificationResult.autoSwitched && verificationResult.correctProviderId) {
          setValue('network', verificationResult.correctProviderId);
          const plans = await fetchDataPlans(verificationResult.correctProviderId, country);
          setAvailablePlans(plans);
        }

        const selectedPlan = availablePlans.find(plan => plan.id === values.plan);
        const networkName = networks.find(net => net.id === values.network)?.name || '';
        

        const hasEnoughBalance = await checkTokenBalance(selectedToken, selectedPrice.toString(), values.country);
        if (!hasEnoughBalance) {
          Alert.alert("Error", `Insufficient ${selectedToken} balance to complete this transaction.`);
          return;
        }
        


        const success = await handleTransaction({
          type: 'data',
          amount: selectedPrice.toString(),
          token: selectedToken,
          recipient: values.phoneNumber,
          metadata: {
            countryCode: values.country,
            networkId: values.network,
            planId: values.plan,
            planName: selectedPlan?.name || '',
            network: networkName
          }
        });

        if (success) {


          // Make top-up API call here
          // ... (implementation similar to web version)
          
          Alert.alert("Success", `Successfully topped up ${values.phoneNumber} with ${selectedPlan?.name || 'your selected plan'}.`);
          
          reset({
            ...values,
            phoneNumber: "",
            network: "",
            plan: "",
          });
          setSelectedPrice(0);
        }
      } else {
        Alert.alert("Error", "Phone number verification failed. Please double-check the phone number.");
      }
    } catch (error) {
      console.error("Error in submission flow:", error);
      Alert.alert("Error", "There was an unexpected error processing your request.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1 p-6">
        <Card className="bg-gradient-to-br from-white to-yellow-50 dark:from-gray-900 dark:to-gray-800 border-yellow-400/20" children={undefined}>
          <CardContent className="space-y-6" children={undefined}>
            <Controller
              control={control}
              name="country"
              render={({ field: { onChange, value } }) => (
                <View>
                  <CountrySelector
                    value={value}
                    onChange={onChange}
                    className={errors.country ? 'border-red-500' : ''}
                  />
                  {errors.country && (
                    <Text className="text-red-500 text-sm mt-1">{errors.country.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Phone Number"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  description="Enter the phone number to recharge."
                  error={errors.phoneNumber?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="network"
              render={({ field: { onChange, value } }) => (
                <View>
                  <Select
                    label="Network Provider"
                    options={networkOptions}
                    value={value}
                    onValueChange={onChange}
                    placeholder="Select network provider"
                    disabled={isLoading || networks.length === 0}
                  />
                  {errors.network && (
                    <Text className="text-red-500 text-sm mt-1">{errors.network.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="plan"
              render={({ field: { onChange, value } }) => (
                <View>
                  <Select
                    label="Data Plan"
                    options={planOptions}
                    value={value}
                    onValueChange={onChange}
                    placeholder="Select data plan"
                    disabled={isLoading || !watchNetwork || availablePlans.length === 0}
                  />
                  {errors.plan && (
                    <Text className="text-red-500 text-sm mt-1">{errors.plan.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  description="Enter your email for transaction receipt."
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="paymentToken"
              render={({ field: { onChange, value } }) => (
                <View>
                  <Select
                    label="Payment Token"
                    options={tokenOptions}
                    value={value}
                    onValueChange={onChange}
                    placeholder="Select payment token"
                  />
                  {errors.paymentToken && (
                    <Text className="text-red-500 text-sm mt-1">{errors.paymentToken.message}</Text>
                  )}
                </View>
              )}
            />

            {selectedPrice > 0 && (
              <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <Text className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Total Amount: ${selectedPrice.toFixed(2)}
                </Text>
              </View>
            )}

            <Button
              onPress={handleSubmit(onSubmit)}
              disabled={isProcessing || isLoading}
              className="w-full"
            >
              {isProcessing ? "Processing..." : "Top Up"}
            </Button>
          </CardContent>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}