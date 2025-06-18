import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { getQueryClient } from "@/services/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import "@/global.css";
import { View } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  const queryClient = getQueryClient();

  return (
    <View className={colorScheme === "dark" ? "dark flex-1" : "flex-1"}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <LoadingAndErrorHandling>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
          </LoadingAndErrorHandling>
        </ThemeProvider>
      </QueryClientProvider>
    </View>
  );
}
