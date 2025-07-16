import React from "react";
import { View, Modal, TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = false,
  icon = "alert-circle-outline",
}) => {
  const iconColor = destructive ? "#ef4444" : "#f59e0b";
  const iconBgColor = destructive
    ? "bg-red-100 dark:bg-red-900/30"
    : "bg-orange-100 dark:bg-orange-900/30";
  const confirmButtonColor = destructive ? "bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-500" : "bg-blue-100 dark:bg-blue-900 border border-blue-400 dark:border-blue-500";
  const confirmButtonHoverColor = destructive
    ? "active:bg-red-600"
    : "active:bg-blue-600";

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
          <View className="items-center mb-4">
            <View
              className={`w-16 h-16 rounded-full ${iconBgColor} items-center justify-center`}
            >
              <Ionicons name={icon} size={32} color={iconColor} />
            </View>
          </View>

          <ThemedText className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
            {title}
          </ThemedText>

          <ThemedText className="text-base text-gray-600 dark:text-gray-300 text-center mb-6 leading-relaxed">
            {message}
          </ThemedText>

          <View className="flex-row space-x-3 gap-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-gray-100 dark:bg-neutral-800 rounded-xl py-3 px-4 active:bg-gray-200 dark:active:bg-neutral-700"
            >
              <ThemedText className="text-center font-semibold text-gray-700 dark:text-gray-200">
                {cancelText}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              className={`flex-1 ${confirmButtonColor} rounded-xl py-3 px-4 ${confirmButtonHoverColor}`}
            >
              <ThemedText className="text-center font-semibold text-red-500 dark:text-red-100">
                {confirmText}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
