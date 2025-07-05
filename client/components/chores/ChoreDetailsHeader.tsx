import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";

interface ChoreDetailsHeaderProps {
  choreName?: string;
  assignedMemberName?: string;
  onBack: () => void;
  onOptions: () => void;
  showOptions?: boolean;
}

export const ChoreDetailsHeader: React.FC<ChoreDetailsHeaderProps> = ({
  choreName,
  assignedMemberName,
  onBack,
  onOptions,
  showOptions = true,
}) => {
  return (
    <View className="bg-white dark:bg-neutral-900 px-6 pt-12 pb-6 shadow-lg">
      <View className="flex-row items-center justify-between mb-4 mt-6">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="#6b7280" />
        </TouchableOpacity>

        <View className="flex-1 mx-4">
          <ThemedText className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Chore Details
          </ThemedText>
        </View>

        {showOptions ? (
          <TouchableOpacity
            onPress={onOptions}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center"
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#6b7280" />
          </TouchableOpacity>
        ) : (
          <View className="w-10 h-10" />
        )}
      </View>

      <View className="mt-2">
        <ThemedText className="text-2xl font-bold text-gray-900 dark:text-gray-300 mb-1">
          {choreName || "Unnamed Chore"}
        </ThemedText>
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
            {assignedMemberName || "Unassigned"}
          </ThemedText>
        </View>
      </View>
    </View>
  );
};
