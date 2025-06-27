import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import {
  useFonts as useInter,
  Inter_400Regular,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  useFonts as useGrotesk,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { getQueryClient } from "@/services/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import "@/global.css";
import { View } from "react-native";
import { useEffect } from "react";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  SplashScreen.preventAutoHideAsync();

  const [interLoaded] = useInter({
    Inter_400Regular,
    Inter_600SemiBold,
  });

  const [groteskLoaded] = useGrotesk({
    SpaceGrotesk_700Bold,
  });

  const fontsLoaded = interLoaded && groteskLoaded;

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
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
              <Stack.Screen
                name="rooms/[roomId]"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="rooms/[roomId]/add"
                options={{ headerShown: false }}
              />
            </Stack>
            <Toast />
            <StatusBar style="auto" />
          </LoadingAndErrorHandling>
        </ThemeProvider>
      </QueryClientProvider>
    </View>
  );
}
