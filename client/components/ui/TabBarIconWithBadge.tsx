import React from "react";
import { View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";

interface TabBarIconWithBadgeProps {
  name: string;
  focused: boolean;
  color: string;
  size: number;
  badgeCount?: number;
}

export const TabBarIconWithBadge: React.FC<TabBarIconWithBadgeProps> = ({
  name,
  color,
  size,
  badgeCount,
}) => {
  return (
    <View className="relative">
      <Ionicons name={name as any} size={size} color={color} />
      {badgeCount !== undefined && badgeCount > 0 && (
        <View className="absolute -top-2 -right-3 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
          <ThemedText className="text-white text-xs font-bold leading-none">
            {badgeCount > 9 ? "9+" : badgeCount.toString()}
          </ThemedText>
        </View>
      )}
    </View>
  );
};
