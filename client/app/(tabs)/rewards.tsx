import ParallaxScrollView from "@/components/ParallaxScrollView";
import { StyleSheet, View, Text } from "react-native";

export default function RewardsScreen() {
  return (
    <ParallaxScrollView>
      <View style={styles.titleContainer}>
        <Text>Rewards!</Text>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
