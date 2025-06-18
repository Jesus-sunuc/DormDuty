import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <ParallaxScrollView>
      <View style={styles.titleContainer}>
        <Text>Home!</Text>
        <Pressable className="bg-blue-600 px-4 py-2 rounded-lg active:bg-blue-700">
          <Text className="text-white text-center font-semibold">Press Me</Text>
        </Pressable>
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
