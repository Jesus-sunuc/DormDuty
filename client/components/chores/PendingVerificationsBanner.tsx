import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";

interface PendingVerificationsBannerProps {
  pendingCount: number;
  onPress: () => void;
}

export const PendingVerificationsBanner: React.FC<
  PendingVerificationsBannerProps
> = ({ pendingCount, onPress }) => {
  if (pendingCount === 0) return null;

  return (
    <TouchableOpacity onPress={onPress} className="mx-6 mb-4">
      <View className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800/50 flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-blue-200 dark:bg-blue-800/50 items-center justify-center mr-4">
          <Ionicons name="shield-checkmark" size={24} color="#3b82f6" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <ThemedText className="text-sm font-semibold text-blue-800 dark:text-blue-200">
              Admin Review Required
            </ThemedText>
            <View className="w-2 h-2 rounded-full bg-blue-500 ml-2" />
          </View>
          <ThemedText className="text-sm text-blue-700 dark:text-blue-300">
            {pendingCount === 1
              ? "1 completion needs admin verification"
              : `${pendingCount} completions need admin verification`}
          </ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
      </View>
    </TouchableOpacity>
  );
};
