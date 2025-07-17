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
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [message, setMessage] = useState("");

  const createSwapRequestMutation = useCreateSwapRequestMutation();

  const availableMembers = members.filter(
    (member) => member.membershipId !== currentMembershipId
  );

  const isAllSelected = selectedMemberIds.length === availableMembers.length;
  const isPartiallySelected = selectedMemberIds.length > 0 && !isAllSelected;

  const handleSubmit = async () => {
    if (selectedMemberIds.length === 0) {
      toastError("Please select at least one member to request the swap from");
      return;
    }

    try {
      const promises = selectedMemberIds.map((membershipId) =>
        createSwapRequestMutation.mutateAsync({
          fromMembershipId: currentMembershipId,
          request: {
            choreId,
            toMembership: membershipId,
            message: message.trim() || undefined,
          },
        })
      );

      await Promise.all(promises);

      const memberCount = selectedMemberIds.length;
      toastSuccess(
        memberCount === 1
          ? "Swap request sent successfully!"
          : `${memberCount} swap requests sent successfully!`
      );

      onClose();
      setSelectedMemberIds([]);
      setMessage("");
    } catch (error) {
      toastError("Failed to send swap request(s)");
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedMemberIds([]);
    setMessage("");
  };

  const toggleMemberSelection = (membershipId: number) => {
    setSelectedMemberIds((prev) =>
      prev.includes(membershipId)
        ? prev.filter((id) => id !== membershipId)
        : [...prev, membershipId]
    );
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(
        availableMembers.map((member) => member.membershipId)
      );
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-gray-100 dark:bg-black">
        <View className="bg-gray-100 dark:bg-neutral-900 px-6 pt-12 pb-6 shadow-lg border-b-2 border-gray-300 dark:border-neutral-800">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={handleClose}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center"
            >
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
            <View className="flex-1 mx-4">
              <ThemedText className="text-lg font-semibold text-center text-gray-600 dark:text-gray-300">
                Request Chore Swap
              </ThemedText>
            </View>
            <View className="w-10" />
          </View>
          <ThemedText className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Ask another member to take over "{choreName}"
            {selectedMemberIds.length > 0 && (
              <Text className="text-blue-600 dark:text-blue-400">
                {"\n"}
                {selectedMemberIds.length} member
                {selectedMemberIds.length > 1 ? "s" : ""} selected
              </Text>
            )}
          </ThemedText>
        </View>

        <ScrollView className="flex-1 px-6 py-6">
          <View className="bg-gray-100 dark:bg-neutral-900 rounded-2xl p-6 mb-6 border border-gray-300 dark:border-neutral-800">
            <ThemedText className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-300">
              Select Member{availableMembers.length > 1 ? "s" : ""}
            </ThemedText>

            {availableMembers.length === 0 ? (
              <View className="py-8 items-center">
                <Ionicons name="people-outline" size={48} color="#9ca3af" />
                <ThemedText className="text-gray-600 dark:text-gray-400 mt-2 text-center">
                  No other members available
                </ThemedText>
              </View>
            ) : (
              <View className="space-y-3">
                {/* Select All Option */}
                {availableMembers.length > 1 && (
                  <>
                    <TouchableOpacity
                      onPress={toggleSelectAll}
                      className={`flex-row items-center p-4 rounded-xl border mb-3 ${
                        isAllSelected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : isPartiallySelected
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                            : "border-gray-300 dark:border-neutral-700 bg-gray-200 dark:bg-neutral-800"
                      }`}
                    >
                      <View
                        className={`w-4 h-4 rounded border mr-3 items-center justify-center ${
                          isAllSelected
                            ? "border-blue-500 bg-blue-500"
                            : isPartiallySelected
                              ? "border-orange-500 bg-orange-500"
                              : "border-gray-300 dark:border-neutral-600"
                        }`}
                      >
                        {isAllSelected && (
                          <Ionicons name="checkmark" size={12} color="white" />
                        )}
                        {isPartiallySelected && (
                          <Ionicons name="remove" size={12} color="white" />
                        )}
                      </View>
                      <View className="flex-1">
                        <ThemedText className="font-semibold">
                          {isAllSelected ? "Deselect All" : "Select All"}
                        </ThemedText>
                        <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                          {isAllSelected
                            ? "Remove all members from selection"
                            : isPartiallySelected
                              ? `Select all ${availableMembers.length} members`
                              : `Send request to all ${availableMembers.length} members`}
                        </ThemedText>
                      </View>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View className="h-px bg-gray-200 dark:bg-neutral-700 my-2" />
                  </>
                )}

                {/* Individual Members */}
                {availableMembers.map((member) => {
                  const isSelected = selectedMemberIds.includes(
                    member.membershipId
                  );
                  return (
                    <TouchableOpacity
                      key={member.membershipId}
                      onPress={() => toggleMemberSelection(member.membershipId)}
                      className={`flex-row items-center p-4 rounded-xl border mb-2 ${
                        isSelected
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-300 dark:border-neutral-700 bg-gray-200 dark:bg-neutral-800"
                      }`}
                    >
                      <View
                        className={`w-4 h-4 rounded border mr-3 items-center justify-center ${
                          isSelected
                            ? "border-green-500 bg-green-500"
                            : "border-gray-300 dark:border-neutral-600"
                        }`}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={12} color="white" />
                        )}
                      </View>
                      <View className="flex-1">
                        <ThemedText className="font-medium">
                          {member.name}
                        </ThemedText>
                        <ThemedText className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {member.role}
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <View className="bg-gray-100 dark:bg-neutral-900 rounded-2xl p-6 mb-6 border border-gray-300 dark:border-neutral-800">
            <ThemedText className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-300">
              Message (Optional)
            </ThemedText>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Add a message to explain why you need this swap..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              className="bg-gray-200 dark:bg-neutral-800 rounded-xl p-4 text-gray-800 dark:text-white min-h-[100px] border border-gray-300 dark:border-neutral-700"
              style={{ textAlignVertical: "top" }}
            />
          </View>
        </ScrollView>

        <View className="p-6 bg-gray-100 dark:bg-neutral-900 border-t-2 border-gray-300 dark:border-neutral-700">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={
              selectedMemberIds.length === 0 ||
              createSwapRequestMutation.isPending
            }
            className={`py-4 rounded-2xl flex-row items-center justify-center ${
              selectedMemberIds.length === 0 ||
              createSwapRequestMutation.isPending
                ? "bg-gray-300 dark:bg-neutral-700"
                : "bg-blue-600"
            }`}
          >
            {createSwapRequestMutation.isPending ? (
              <>
                <View className="w-5 h-5 border border-white/30 border-t-white rounded-full animate-spin mr-3" />
                <Text className="text-white font-semibold">
                  Sending{selectedMemberIds.length > 1 ? " Requests" : ""}...
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="swap-horizontal" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  Send Request{selectedMemberIds.length > 1 ? "s" : ""}
                  {selectedMemberIds.length > 0 &&
                    ` (${selectedMemberIds.length})`}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
