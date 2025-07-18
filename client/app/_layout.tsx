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
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/useColorScheme";
import { getQueryClient } from "@/services/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import "@/global.css";
import { useEffect } from "react";
import Toast from "react-native-toast-message";
import { AuthProvider } from "@/hooks/user/useAuth";
import { toastConfig } from "@/components/ToastService";

if (__DEV__) {
  require("react-native-reanimated").configureReanimatedLogger({
    strict: false, // Turn off strict mode to reduce warnings
    level: "warn", // Only show warnings and errors
  });
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  SplashScreen.preventAutoHideAsync();

  const interResult = useInter({
    Inter_400Regular,
    Inter_600SemiBold,
  });
  const interLoaded = interResult[0];

  const groteskResult = useGrotesk({
    SpaceGrotesk_700Bold,
  });
  const groteskLoaded = groteskResult[0];

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
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className={colorScheme === "dark" ? "dark flex-1" : "flex-1"}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
              >
                <LoadingAndErrorHandling>
                  <Stack>
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false }}
                    />
                  </Stack>
                  <Toast config={toastConfig} />
                  <StatusBar style="auto" />
                </LoadingAndErrorHandling>
              </ThemeProvider>
            </AuthProvider>
          </QueryClientProvider>
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
