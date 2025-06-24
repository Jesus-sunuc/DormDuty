import ParallaxScrollView from "@/components/ParallaxScrollView";
import { StyleSheet, View, Text } from "react-native";

const RewardsScreen = () => {
  return (
    <ParallaxScrollView>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text>Rewards!</Text>
      </View>
    </ParallaxScrollView>
  );
}

export default RewardsScreen;
