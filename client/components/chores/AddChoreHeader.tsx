import React from "react";
import { View, TouchableOpacity, Text, useColorScheme } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";

interface AddChoreHeaderProps {
  roomId: string;
  isPending: boolean;
  onBack: () => void;
  isEdit?: boolean;
  choreName?: string;
}

export const AddChoreHeader: React.FC<AddChoreHeaderProps> = ({
  roomId,
  isPending,
  onBack,
  isEdit = false,
  choreName,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md pt-16 pb-6 px-6 border-b border-neutral-100 dark:border-neutral-700">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800"
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={Colors[colorScheme ?? "light"].text}
          />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <ThemedText className="text-2xl font-bold text-neutral-900 dark:text-white">
            {isEdit ? "Edit Chore" : "New Chore"}
          </ThemedText>
          <ThemedText className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {isEdit ? `Editing "${choreName}"` : "Create a task for your room"}
          </ThemedText>
        </View>
        <View className="w-10" />
      </View>
    </View>
  );
};
