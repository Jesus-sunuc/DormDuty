import { useColorScheme as useRNColorScheme } from "react-native";

export function useColorScheme() {
  try {
    const scheme = useRNColorScheme();
    return scheme;
  } catch (error) {
    console.warn("useColorScheme - Error in useColorScheme:", error);
    return "light";
  }
}
