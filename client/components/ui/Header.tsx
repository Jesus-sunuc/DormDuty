import React from "react";
import { View, Pressable, StatusBar } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderProps {
  title: string;
  onMenuPress: () => void;
  rightComponent?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onMenuPress,
  rightComponent,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-white dark:bg-neutral-900 px-6 pb-4 shadow-lg border-b border-gray-100 dark:border-neutral-800"
      style={{
        paddingTop: Math.max(insets.top, StatusBar.currentHeight || 0) + 16,
      }}
    >
      <View className="flex-row items-center justify-between">
        {/* Hamburger Menu */}
        <Pressable
          onPress={onMenuPress}
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center active:bg-gray-200 dark:active:bg-neutral-700 mr-3"
        >
          <Ionicons name="menu" size={20} color="#6b7280" />
        </Pressable>

        {/* Title */}
        <View className="flex-1">
          <ThemedText className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </ThemedText>
        </View>

        {/* Right Component (optional) */}
        {rightComponent && <View className="ml-3">{rightComponent}</View>}
      </View>
    </View>
  );
};
