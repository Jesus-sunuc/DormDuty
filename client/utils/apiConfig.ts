import { Platform } from "react-native";

export const getApiUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const basePort = "8000";

  if (__DEV__) {
    if (Platform.OS === "android") {
      return `http://10.0.2.2:${basePort}/`;
    } else if (Platform.OS === "ios") {
      return `http://localhost:${basePort}/`;
    }
  }

  return `http://localhost:${basePort}/`;
};
