import React, { useState } from "react";
import { View, TouchableOpacity, Modal, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";

interface Member {
  userId: number;
  name: string;
  membershipId: number;
  role: string;
}

interface MemberSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  members: Member[];
  selectedMemberIds: number[];
  onSelectionChange: (memberIds: number[]) => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmButtonText?: string;
  allowMultiple?: boolean;
}

export const MemberSelectionModal: React.FC<MemberSelectionModalProps> = ({
  isVisible,
  onClose,
  members,
  selectedMemberIds,
  onSelectionChange,
  onConfirm,
  title,
  description = "Select members:",
  confirmButtonText = "Assign",
  allowMultiple = true,
}) => {
  const toggleMember = (membershipId: number) => {
    if (!allowMultiple) {
      onSelectionChange([membershipId]);
    } else {
      if (selectedMemberIds.includes(membershipId)) {
        onSelectionChange(
          selectedMemberIds.filter((id) => id !== membershipId)
        );
      } else {
        onSelectionChange([...selectedMemberIds, membershipId]);
      }
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-md max-h-96">
          <View className="flex-row items-center justify-between mb-4">
            <ThemedText className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </ThemedText>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ThemedText className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {description}
          </ThemedText>

          <ScrollView className="max-h-48 mb-4">
            {members.map((member) => {
              const isSelected = selectedMemberIds.includes(
                member.membershipId
              );
              return (
                <TouchableOpacity
                  key={member.membershipId}
                  onPress={() => toggleMember(member.membershipId)}
                  className={`flex-row items-center p-3 rounded-xl mb-2 ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-500"
                      : "bg-gray-50 dark:bg-neutral-800"
                  }`}
                >
                  <View
                    className={`w-5 h-5 rounded border-2 items-center justify-center mr-3 ${
                      isSelected
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300 dark:border-neutral-600"
                    }`}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={12} color="white" />
                    )}
                  </View>

                  <View className="flex-1">
                    <ThemedText className="font-medium text-gray-900 dark:text-white">
                      {member.name}
                    </ThemedText>
                    <ThemedText className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {member.role}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-gray-200 dark:bg-neutral-700 rounded-xl py-3 items-center"
            >
              <ThemedText className="font-medium text-gray-700 dark:text-gray-300">
                Cancel
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              disabled={selectedMemberIds.length === 0}
              className={`flex-1 rounded-xl py-3 items-center ${
                selectedMemberIds.length > 0
                  ? "bg-blue-500"
                  : "bg-gray-300 dark:bg-neutral-600"
              }`}
            >
              <ThemedText
                className={`font-medium ${
                  selectedMemberIds.length > 0
                    ? "text-white"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {confirmButtonText} ({selectedMemberIds.length})
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
