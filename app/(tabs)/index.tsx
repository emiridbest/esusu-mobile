import { useRouter } from "expo-router";
import {
  Image,
  View
} from "react-native";

import { images } from "@/constants/images";

import BalanceCard from "@/components/minisafe/BalanceCard";

const Index = () => {
  const router = useRouter();


  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />


              <BalanceCard />

    </View>
  );
};

export default Index;
