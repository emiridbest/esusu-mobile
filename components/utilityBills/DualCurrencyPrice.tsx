// src/components/forms/DualCurrencyPrice.tsx
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useUtility } from '../../context/utilityProvider/UtilityContext';
import { getCountryData } from '../../utils/countryData';
import { Skeleton } from '../ui/Skeleton';

interface DualCurrencyPriceProps {
  amount: number | string;
  countryCurrency?: string;
  stablecoin?: string;
  includeGasFee?: boolean;
  showTotal?: boolean;
  className?: string;
}

export function parseAmount(amount: string | number): number {
  if (typeof amount === 'string') {
    const cleanAmount = amount.replace(/[₦$,]/g, '').trim();
    return parseFloat(cleanAmount) || 0;
  }
  return amount || 0;
}

export function formatCurrency(amount: number, currency: string): string {
  if (isNaN(amount)) return '0.00';
  const currencyCode = getCountryData(currency)?.currency?.code;
  
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
      minimumFractionDigits: 2,
    });
    return formatter.format(amount);
  } catch {
    return `${currencyCode || '$'} ${amount.toFixed(2)}`;
  }
}

export default function DualCurrencyPrice({
  amount,
  stablecoin = '',
  countryCurrency = '',
  includeGasFee = false,
  showTotal = false,
  className = ''
}: DualCurrencyPriceProps) {
  const { convertCurrency } = useUtility();
  const [loading, setLoading] = useState(true);
  const [localDisplay, setLocalDisplay] = useState('');
  const [cryptoDisplay, setCryptoDisplay] = useState('');
  const [totalDisplay, setTotalDisplay] = useState('');
  const [gasFeeDisplay, setGasFeeDisplay] = useState('');

  useEffect(() => {
    const fetchPrices = async () => {
      if (!amount && countryCurrency) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const parsedAmount = parseAmount(amount);
        setLocalDisplay(formatCurrency(parsedAmount, countryCurrency));

        let usdAmount;
        try {
          usdAmount = await convertCurrency(parsedAmount.toString(), countryCurrency);
        } catch (error) {
          console.error('Error converting to USD:', error);
          usdAmount = 0;
        }

        setCryptoDisplay(`${stablecoin} ${usdAmount.toFixed(2)}`);

        if (showTotal) {
          const gasFeeUSD = 0.01;
          const totalWithFee = usdAmount + gasFeeUSD;
          setGasFeeDisplay(`${stablecoin} ${gasFeeUSD.toFixed(2)}`);
          setTotalDisplay(`${stablecoin} ${totalWithFee.toFixed(2)}`);
        }
      } catch (error) {
        console.error('Error fetching price data:', error);
        setLocalDisplay(formatCurrency(parseAmount(amount), countryCurrency));
        setCryptoDisplay(`${stablecoin} 0.00`);
        if (showTotal) {
          setGasFeeDisplay(`${stablecoin} 0.01`);
          setTotalDisplay(`${stablecoin} 0.01`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [amount, stablecoin, includeGasFee, showTotal, convertCurrency, countryCurrency]);

  if (loading) {
    return (
      <View className={`space-y-2 ${className}`}>
        <Skeleton height={20} width="60%" />
        <Skeleton height={20} width="50%" />
        {showTotal && <Skeleton height={20} width="70%" />}
      </View>
    );
  }

  return (
    <View className={className}>
      <View className="space-y-1">
        <Text className="text-base font-medium dark:text-black/70">
          {localDisplay}
        </Text>
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          ≈ {cryptoDisplay}
        </Text>

        {showTotal && (
          <>
            <Text className="text-xs text-gray-500 pt-1">
              Gas Fee: {gasFeeDisplay}
            </Text>
            <Text className="text-sm font-medium text-black/70 pt-1">
              Total: {totalDisplay}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}