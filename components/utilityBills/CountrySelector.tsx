import React from 'react';
import { Image, View } from 'react-native';
import { getAllCountries } from '../../utils/countryData';
import { Select } from '../ui/Select';

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export default function CountrySelector({ 
  value, 
  onChange, 
  label = "Country",
  className = '' 
}: CountrySelectorProps) {
  const countries = getAllCountries();
  
  const countryOptions = countries.map(country => ({
    label: country.name,
    value: country.code,
  }));

  const selectedCountry = countries.find(c => c.code === value);

  return (
    <View className={className}>
      <Select
        label={label}
        options={countryOptions}
        value={value}
        onValueChange={onChange}
        placeholder="Select a country"
      />
      
      {/* Custom trigger to show flag */}
      {selectedCountry && selectedCountry.flag && (
        <View className="absolute right-10 top-9 flex-row items-center">
          <View className="w-4 h-4 rounded overflow-hidden mr-2">
            <Image
              source={{ uri: selectedCountry.flag }}
              style={{ width: 16, height: 16 }}
              resizeMode="cover"
            />
          </View>
        </View>
      )}
    </View>
  );
}