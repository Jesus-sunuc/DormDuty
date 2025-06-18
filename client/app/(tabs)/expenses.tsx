import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Text, View } from "react-native";

export default function ExpensesScreen() {
  return (
    <ParallaxScrollView>
      <View>
        <Text>Expenses!</Text>
      </View>
    </ParallaxScrollView>
  );
}