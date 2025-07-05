import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Get the appropriate API URL based on the platform and environment
 */
export const getApiUrl = (): string => {
  // First check if we have an explicit environment variable
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Fallback to platform-specific defaults for local development
  const basePort = "8000";

  if (__DEV__) {
    if (Platform.OS === "android") {
      // Android emulator uses 10.0.2.2 to access host machine
      return `http://10.0.2.2:${basePort}/`;
    } else if (Platform.OS === "ios") {
      // iOS simulator can use localhost
      return `http://localhost:${basePort}/`;
    }
  }

  // Production fallback (you should set EXPO_PUBLIC_API_URL for production)
  return `http://localhost:${basePort}/`;
};
