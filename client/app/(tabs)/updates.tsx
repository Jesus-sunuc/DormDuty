import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { View, Text } from "react-native";

const Updates = () => {
  return (
    <ParallaxScrollView>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <ThemedText>Updates</ThemedText>
      </View>
    </ParallaxScrollView>
  );
}

export default Updates;
