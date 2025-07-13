import React, { useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCreateSwapRequestMutation } from "@/hooks/choreSwapHooks";
import { toastError, toastSuccess } from "@/components/ToastService";

interface Member {
  userId: number;
  name: string;
  membershipId: number;
  role: string;
}

interface ChoreSwapRequestModalProps {
  isVisible: boolean;
  onClose: () => void;
  choreId: number;
  choreName: string;
  currentMembershipId: number;
  members: Member[];
}

export const ChoreSwapRequestModal: React.FC<ChoreSwapRequestModalProps> = ({
  isVisible,
  onClose,
  choreId,
  choreName,
  currentMembershipId,
  members,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const createSwapRequestMutation = useCreateSwapRequestMutation();

  const availableMembers = members.filter(
    (member) => member.membershipId !== currentMembershipId
  );

  const handleSubmit = () => {
    if (!selectedMemberId) {
      toastError("Please select a member to request the swap from");
      return;
    }

    createSwapRequestMutation.mutate(
      {
        fromMembershipId: currentMembershipId,
        request: {
          choreId,
          toMembership: selectedMemberId,
          message: message.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toastSuccess("Swap request sent successfully!");
          onClose();
          setSelectedMemberId(null);
          setMessage("");
        },
        onError: () => {
          toastError("Failed to send swap request");
        },
      }
    );
  };

  const handleClose = () => {
    onClose();
    setSelectedMemberId(null);
    setMessage("");
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-gray-50 dark:bg-black">
        <View className="bg-white dark:bg-neutral-900 px-6 pt-12 pb-6 shadow-lg">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={handleClose}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center"
            >
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
            <View className="flex-1 mx-4">
              <ThemedText className="text-lg font-semibold text-center">
                Request Chore Swap
              </ThemedText>
            </View>
            <View className="w-10" />
          </View>
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Ask another member to take over "{choreName}"
          </ThemedText>
        </View>

        <ScrollView className="flex-1 px-6 py-6">
          <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 shadow-sm">
            <ThemedText className="text-lg font-semibold mb-4">
              Select Member
            </ThemedText>

            {availableMembers.length === 0 ? (
              <View className="py-8 items-center">
                <Ionicons name="people-outline" size={48} color="#9ca3af" />
                <ThemedText className="text-gray-500 dark:text-gray-400 mt-2 text-center">
                  No other members available
                </ThemedText>
              </View>
            ) : (
              <View className="space-y-3">
                {availableMembers.map((member) => (
                  <TouchableOpacity
                    key={member.membershipId}
                    onPress={() => setSelectedMemberId(member.membershipId)}
                    className={`flex-row items-center p-4 rounded-xl border-2 ${
                      selectedMemberId === member.membershipId
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800"
                    }`}
                  >
                    <View
                      className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        selectedMemberId === member.membershipId
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300 dark:border-neutral-600"
                      }`}
                    >
                      {selectedMemberId === member.membershipId && (
                        <Ionicons name="checkmark" size={12} color="white" />
                      )}
                    </View>
                    <View className="flex-1">
                      <ThemedText className="font-medium">
                        {member.name}
                      </ThemedText>
                      <ThemedText className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {member.role}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 shadow-sm">
            <ThemedText className="text-lg font-semibold mb-4">
              Message (Optional)
            </ThemedText>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Add a message to explain why you need this swap..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 text-gray-900 dark:text-white min-h-[100px]"
              style={{ textAlignVertical: "top" }}
            />
          </View>
        </ScrollView>

        <View className="p-6 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-700">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!selectedMemberId || createSwapRequestMutation.isPending}
            className={`py-4 rounded-2xl flex-row items-center justify-center ${
              !selectedMemberId || createSwapRequestMutation.isPending
                ? "bg-gray-300 dark:bg-neutral-700"
                : "bg-blue-600"
            }`}
          >
            {createSwapRequestMutation.isPending ? (
              <>
                <View className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                <Text className="text-white font-semibold">Sending...</Text>
              </>
            ) : (
              <>
                <Ionicons name="swap-horizontal" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  Send Request
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
