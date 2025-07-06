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
  roomId,
  isPending,
  onBack,
  onSave,
  isEdit = false,
  choreName,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View className="bg-white dark:bg-neutral-900 px-6 pt-12 pb-6 shadow-lg">
      <View className="flex-row items-center justify-between mb-4 mt-5">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center"
        >
          <Text className="text-gray-600 dark:text-gray-300 text-sm font-medium">
            ✕
          </Text>
        </TouchableOpacity>

        <View className="flex-1 mx-4">
          <ThemedText className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {isEdit ? "Edit Chore" : "New Chore"}
          </ThemedText>
        </View>

        <TouchableOpacity
          disabled={isPending}
          onPress={onSave}
          activeOpacity={0.8}
          style={{
            shadowColor: colors.shadowColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
            opacity: isPending ? 0.6 : 1,
          }}
          className="bg-emerald-500 dark:bg-emerald-900 border border-emerald-400 dark:border-emerald-500 px-3 py-2 rounded-xl flex-row items-center"
        >
          <Ionicons name="checkmark" size={17} color="white" />
          <Text className="text-white text-center ml-1 mr-1">
            {isPending
              ? isEdit
                ? "Updating..."
                : "Saving..."
              : isEdit
                ? "Update"
                : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <View>
        <ThemedText className="text-2xl font-bold text-gray-900 dark:text-gray-300 mb-1">
          {isEdit ? "Edit Chore" : "Create Chore"}
        </ThemedText>
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
            {isEdit
              ? `Editing "${choreName}" in room #${roomId}`
              : `Add a new task to room #${roomId}`}
          </ThemedText>
        </View>
      </View>
    </View>
  );
};
