import React from "react";
import { View, TouchableOpacity, Modal } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";

interface ChoreOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRequestSwap?: () => void;
  showRequestSwap?: boolean;
  isAdmin?: boolean;
}

export const ChoreOptionsModal: React.FC<ChoreOptionsModalProps> = ({
  visible,
  onClose,
  onEdit,
  onDelete,
  onRequestSwap,
  showRequestSwap = false,
  isAdmin = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-end"
        activeOpacity={1}
        onPress={onClose}
      >
        <View className="bg-white dark:bg-neutral-900 rounded-t-3xl p-6 pb-8">
          <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full self-center mb-6" />

          <ThemedText className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Chore Options
          </ThemedText>

          {showRequestSwap && onRequestSwap && (
            <TouchableOpacity
              onPress={onRequestSwap}
              className="flex-row items-center py-4 px-2 rounded-xl mb-2 active:bg-gray-100 dark:active:bg-neutral-800"
            >
              <View className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mr-3">
                <Ionicons name="swap-horizontal" size={20} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <ThemedText className="text-base font-medium text-gray-900 dark:text-white">
                  Request Swap
                </ThemedText>
                <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                  Ask someone else to take this chore
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </TouchableOpacity>
          )}

          {isAdmin && (
            <TouchableOpacity
              onPress={onEdit}
              className="flex-row items-center py-4 px-2 rounded-xl mb-2 active:bg-gray-100 dark:active:bg-neutral-800"
            >
              <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-3">
                <Ionicons name="create-outline" size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <ThemedText className="text-base font-medium text-gray-900 dark:text-white">
                  Edit Chore
                </ThemedText>
                <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                  Modify chore details
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </TouchableOpacity>
          )}

          {isAdmin && (
            <TouchableOpacity
              onPress={onDelete}
              className="flex-row items-center py-4 px-2 rounded-xl active:bg-red-50 dark:active:bg-red-900/20"
            >
              <View className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mr-3">
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </View>
              <View className="flex-1">
                <ThemedText className="text-base font-medium text-red-600 dark:text-red-400">
                  Delete Chore
                </ThemedText>
                <ThemedText className="text-sm text-red-500 dark:text-red-400">
                  Remove this chore permanently
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
