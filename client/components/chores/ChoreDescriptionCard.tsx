import React from "react";
import { View } from "react-native";
import { ThemedText } from "@/components/ThemedText";

interface ChoreDescriptionCardProps {
  description: string;
}

export const ChoreDescriptionCard: React.FC<ChoreDescriptionCardProps> = ({
  description,
}) => {
  return (
    <View className="bg-gray-100 dark:bg-neutral-900 rounded-2xl p-6 mb-6 border border-gray-300 dark:border-neutral-800">
      <ThemedText className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
        Description
      </ThemedText>
      <ThemedText className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
        {description}
      </ThemedText>
    </View>
  );
};
