import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";

interface SwapRequestNotificationBannerProps {
  requestCount: number;
  onPress: () => void;
}

export const SwapRequestNotificationBanner: React.FC<
  SwapRequestNotificationBannerProps
> = ({ requestCount, onPress }) => {
  if (requestCount === 0) return null;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mx-6 mt-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4 "
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 items-center justify-center mr-3 ">
          <Ionicons name="swap-horizontal" size={20} color="#f59e0b" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <ThemedText className="text-sm font-semibold text-orange-800 dark:text-orange-200">
              Chore Swap Request{requestCount > 1 ? "s" : ""}
            </ThemedText>
            <View className="w-2 h-2 rounded-full bg-orange-500 ml-2" />
          </View>
          <ThemedText className="text-sm text-orange-700 dark:text-orange-300">
            {requestCount === 1
              ? "You have 1 pending swap request"
              : `You have ${requestCount} pending swap requests`}
          </ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#f59e0b" />
      </View>
    </TouchableOpacity>
  );
};
