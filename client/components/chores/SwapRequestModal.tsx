import React from "react";
import { View, Modal, TouchableOpacity, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ChoreSwapRequest } from "@/models/ChoreSwapRequest";
import { SwapRequestCard } from "./SwapRequestCard";

interface SwapRequestModalProps {
  isVisible: boolean;
  onClose: () => void;
  requests: ChoreSwapRequest[];
  currentMembershipId: number;
  onRequestUpdate?: () => void;
}

export const SwapRequestModal: React.FC<SwapRequestModalProps> = ({
  isVisible,
  onClose,
  requests,
  currentMembershipId,
  onRequestUpdate,
}) => {
  const handleRequestUpdate = () => {
    onRequestUpdate?.();
    if (requests.length <= 1) {
      onClose();
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50 dark:bg-black">
        <View className="bg-white dark:bg-neutral-900 px-6 pt-12 pb-6 shadow-lg">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center"
            >
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
            <View className="flex-1 mx-4">
              <ThemedText className="text-lg font-semibold text-center">
                Swap Requests
              </ThemedText>
            </View>
            <View className="w-10" />
          </View>
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {requests.length === 1
              ? "1 pending request"
              : `${requests.length} pending requests`}
          </ThemedText>
        </View>

        <ScrollView className="flex-1 px-6 py-6">
          {requests.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons
                name="checkmark-circle-outline"
                size={64}
                color="#22c55e"
              />
              <ThemedText className="text-center text-gray-500 mt-4 text-lg font-medium">
                All caught up!
              </ThemedText>
              <ThemedText className="text-center text-gray-400 mt-2 text-sm">
                You have no pending swap requests
              </ThemedText>
            </View>
          ) : (
            <View>
              {requests.map((request) => (
                <SwapRequestCard
                  key={request.swapId}
                  request={request}
                  currentMembershipId={currentMembershipId}
                  onRequestUpdate={handleRequestUpdate}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};
