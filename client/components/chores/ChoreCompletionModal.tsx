import React, { useState } from "react";
import { View, Modal, TouchableOpacity, Text, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCompleteChoreMutation } from "@/hooks/choreHooks";
import { toastError, toastSuccess } from "@/components/ToastService";
import { Chore } from "@/models/Chore";

interface ChoreCompletionModalProps {
  isVisible: boolean;
  onClose: () => void;
  chore: Chore;
  membershipId: number;
}

export const ChoreCompletionModal: React.FC<ChoreCompletionModalProps> = ({
  isVisible,
  onClose,
  chore,
  membershipId,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const completeChoreeMutation = useCompleteChoreMutation();

  const handleComplete = async () => {
    // Check if photo is required but not provided
    if (chore.photoRequired && !photoUrl) {
      Alert.alert(
        "Photo Required",
        "This chore requires photo proof. Please add a photo before completing.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      await completeChoreeMutation.mutateAsync({
        choreId: chore.choreId,
        membershipId,
        completionRequest: {
          choreId: chore.choreId,
          photoUrl,
        },
      });

      if (chore.approvalRequired) {
        toastSuccess(
          `"${chore.name}" has been submitted for admin review. You'll be notified when it's approved!`
        );
      } else {
        toastSuccess(`"${chore.name}" completed successfully!`);
      }
      onClose();
    } catch (error) {
      toastError(`Failed to complete "${chore.name}". Please try again.`);
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
              <ThemedText className="text-lg font-semibold text-center text-gray-700 dark:text-gray-300">
                Complete Chore
              </ThemedText>
            </View>
            <View className="w-10" />
          </View>
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {chore.approvalRequired
              ? `Mark "${chore.name}" as completed for admin review`
              : `Mark "${chore.name}" as completed`}
          </ThemedText>
        </View>

        <View className="flex-1 px-6 py-6">
          <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-4">
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              </View>
              <View className="flex-1">
                <ThemedText className="text-lg font-semibold text-gray-900 dark:text-white">
                  {chore.name}
                </ThemedText>
                <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                  {chore.approvalRequired
                    ? "Requires admin approval"
                    : "Ready to complete"}
                </ThemedText>
              </View>
            </View>

            {/* Photo Upload Section - Only shown if photo is required */}
            {chore.photoRequired && (
              <View className="mb-4">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="camera" size={20} color="#f97316" />
                  <ThemedText className="text-base font-medium text-gray-900 dark:text-white ml-2">
                    Photo Proof Required
                  </ThemedText>
                </View>

                {photoUrl ? (
                  <View className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#10b981"
                      />
                      <ThemedText className="text-green-700 dark:text-green-300 ml-2">
                        Photo uploaded successfully
                      </ThemedText>
                    </View>
                    <TouchableOpacity
                      onPress={() => setPhotoUrl(undefined)}
                      className="mt-2"
                    >
                      <ThemedText className="text-blue-600 dark:text-blue-400 text-sm">
                        Upload different photo
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      // TODO: Implement photo picker
                      // For now, just set a placeholder
                      setPhotoUrl("https://placeholder.photo.url");
                    }}
                    className="border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-xl p-6 items-center"
                  >
                    <Ionicons name="camera-outline" size={32} color="#f97316" />
                    <ThemedText className="text-orange-600 dark:text-orange-400 font-medium mt-2">
                      Add Photo Proof
                    </ThemedText>
                    <ThemedText className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      Tap to upload a photo of your completed work
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Info message based on approval requirements */}
            <View
              className={`rounded-xl p-4 ${
                chore.approvalRequired
                  ? "bg-blue-50 dark:bg-blue-900/20"
                  : "bg-green-50 dark:bg-green-900/20"
              }`}
            >
              <View className="flex-row items-start">
                <Ionicons
                  name={chore.approvalRequired ? "time" : "checkmark-circle"}
                  size={20}
                  color={chore.approvalRequired ? "#3b82f6" : "#10b981"}
                />
                <View className="flex-1 ml-3">
                  <ThemedText
                    className={`text-sm font-medium mb-1 ${
                      chore.approvalRequired
                        ? "text-blue-800 dark:text-blue-200"
                        : "text-green-800 dark:text-green-200"
                    }`}
                  >
                    {chore.approvalRequired
                      ? "Admin Approval Required"
                      : "Instant Completion"}
                  </ThemedText>
                  <ThemedText
                    className={`text-sm ${
                      chore.approvalRequired
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-green-700 dark:text-green-300"
                    }`}
                  >
                    {chore.approvalRequired
                      ? "Once you submit, a room admin will review and approve your work."
                      : "This chore will be marked as complete immediately."}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="p-6 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-700">
          <TouchableOpacity
            onPress={handleComplete}
            disabled={completeChoreeMutation.isPending}
            className={`py-4 rounded-2xl flex-row items-center justify-center ${
              completeChoreeMutation.isPending
                ? "bg-gray-300 dark:bg-neutral-700"
                : "bg-green-600"
            }`}
          >
            {completeChoreeMutation.isPending ? (
              <>
                <View className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                <Text className="text-white font-semibold">Completing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  Mark as Complete
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
