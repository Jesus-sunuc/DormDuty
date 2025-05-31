import { colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";

const index = () => {
    const router = useRouter();
    useEffect(() => {
        setTimeout(() => {
            router.push("/(auth)/welcome");
        }, 800);
    }, [])
  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        resizeMode="contain"
        source={require("../assets/icons/splash.png")}
      />
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.neutral900,
  },
  logo: {
    height: "20%",
    aspectRatio: 1,
  },
});
