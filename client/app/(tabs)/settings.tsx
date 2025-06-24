import ParallaxScrollView from "@/components/ParallaxScrollView";
import { StyleSheet, View, Text} from "react-native";

const SeettingsScreen = () => {
  return (
    <ParallaxScrollView>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text>Settings!</Text>
      </View>
    </ParallaxScrollView>
  );
}

export default SeettingsScreen;