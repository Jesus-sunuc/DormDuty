import React from "react";
import { View, TouchableOpacity, Text, useColorScheme } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";

interface AddChoreHeaderProps {
  roomId: string;
  isPending: boolean;
  onBack: () => void;
  onSave: () => void;
  isEdit?: boolean;
  choreName?: string;
}

export const AddChoreHeader: React.FC<AddChoreHeaderProps> = ({
  onBack,
  onSave,
  isPending,
  isEdit = false,
  choreName,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View className="bg-gray-100/80 dark:bg-neutral-900/80 pt-16 pb-6 px-6 border-b-2 border-gray-300 dark:border-neutral-800">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700"
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={Colors[colorScheme ?? "light"].text}
          />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <ThemedText className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {isEdit ? "Edit Chore" : "New Chore"}
          </ThemedText>
          <ThemedText className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
            {isEdit ? `Editing "${choreName}"` : "Create a task for your room"}
          </ThemedText>
        </View>
        <TouchableOpacity
          onPress={onSave}
          disabled={isPending}
          className="w-20 h-10 items-center justify-center rounded-xl border border-blue-500 dark:border-blue-400"
          style={{
            backgroundColor: isPending
              ? colorScheme === "dark"
                ? "#374151"
                : "#e5e7eb"
              : colorScheme === "dark"
                ? "#1e40af"
                : "#3b82f6",
          }}
        >
          <ThemedText
            className="text-sm font-semibold"
            style={{
              color: isPending
                ? colorScheme === "dark"
                  ? "#6b7280"
                  : "#9ca3af"
                : "#ffffff",
            }}
          >
            {isPending ? "..." : isEdit ? "Update" : "Create"}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};
