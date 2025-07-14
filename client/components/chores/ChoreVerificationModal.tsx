import React, { useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ChoreCompletion } from "@/models/Chore";
import { useVerifyCompletionMutation } from "@/hooks/choreHooks";
import { toastError, toastSuccess } from "@/components/ToastService";
import { formatDistance } from "date-fns";

interface ChoreVerificationModalProps {
  isVisible: boolean;
  onClose: () => void;
  completions: ChoreCompletion[];
  verifierMembershipId: number;
  isAdmin?: boolean;
}

interface CompletionWithChoreInfo extends ChoreCompletion {
  choreName?: string;
  completedBy?: string;
  roomId?: number;
}

export const ChoreVerificationModal: React.FC<ChoreVerificationModalProps> = ({
  isVisible,
  onClose,
  completions = [],
  verifierMembershipId,
  isAdmin = false,
}) => {
  const [selectedCompletion, setSelectedCompletion] =
    useState<CompletionWithChoreInfo | null>(null);
  const [verificationComment, setVerificationComment] = useState("");
  const [showVerificationForm, setShowVerificationForm] = useState(false);

  const verifyCompletionMutation = useVerifyCompletionMutation();

  const handleVerification = async (
    verificationType: "approved" | "rejected"
  ) => {
    if (!selectedCompletion) return;

    try {
      await verifyCompletionMutation.mutateAsync({
        completionId: selectedCompletion.completionId,
        membershipId: verifierMembershipId,
        verificationRequest: {
          completionId: selectedCompletion.completionId,
          verificationType,
          comment: verificationComment.trim() || undefined,
        },
      });

      const actionText =
        verificationType === "approved" ? "approved" : "rejected";
      toastSuccess(`Completion ${actionText} successfully!`);

      // Reset state
      setSelectedCompletion(null);
      setVerificationComment("");
      setShowVerificationForm(false);

      // Close modal if no more completions
      if (completions.length <= 1) {
        onClose();
      }
    } catch (error) {
      toastError(`Failed to ${verificationType} completion`);
    }
  };

  const startVerification = (completion: CompletionWithChoreInfo) => {
    setSelectedCompletion(completion);
    setShowVerificationForm(true);
  };

  const closeVerificationForm = () => {
    setSelectedCompletion(null);
    setVerificationComment("");
    setShowVerificationForm(false);
  };

  const pendingCompletions = completions.filter((c) => c.status === "pending");

  if (showVerificationForm && selectedCompletion) {
    return (
      <Modal
        visible={isVisible}
        animationType="slide"
        onRequestClose={closeVerificationForm}
      >
        <View className="flex-1 bg-gray-50 dark:bg-black">
          <View className="bg-white dark:bg-neutral-900 px-6 pt-12 pb-6 shadow-lg">
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity
                onPress={closeVerificationForm}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center"
              >
                <Ionicons name="arrow-back" size={20} color="#6b7280" />
              </TouchableOpacity>
              <View className="flex-1 mx-4">
                <ThemedText className="text-lg font-semibold text-center text-gray-700 dark:text-gray-300">
                  Verify Completion
                </ThemedText>
              </View>
              <View className="w-10" />
            </View>
          </View>

          <ScrollView className="flex-1 px-6 py-6">
            <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 shadow-sm">
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-4">
                  <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <ThemedText className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedCompletion.choreName || "Chore"}
                  </ThemedText>
                  <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                    Completed by {selectedCompletion.completedBy || "Unknown"} •{" "}
                    {formatDistance(
                      new Date(selectedCompletion.completedAt),
                      new Date(),
                      { addSuffix: true }
                    )}
                  </ThemedText>
                </View>
              </View>

              {selectedCompletion.photoUrl && (
                <View className="mb-4">
                  <ThemedText className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Completion Photo:
                  </ThemedText>
                  <Image
                    source={{ uri: selectedCompletion.photoUrl }}
                    className="w-full h-48 rounded-xl"
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>

            <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 shadow-sm">
              <ThemedText className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
                Add Comment (Optional)
              </ThemedText>
              <TextInput
                value={verificationComment}
                onChangeText={setVerificationComment}
                placeholder="Add feedback about this completion..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 text-gray-900 dark:text-white min-h-[100px]"
                style={{ textAlignVertical: "top" }}
              />
            </View>
          </ScrollView>

          <View className="p-6 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-700 flex-row gap-3">
            <TouchableOpacity
              onPress={() => handleVerification("rejected")}
              disabled={verifyCompletionMutation.isPending}
              className="flex-1 bg-red-100 dark:bg-red-900/30 py-4 rounded-2xl flex-row items-center justify-center"
            >
              {verifyCompletionMutation.isPending ? (
                <View className="w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
              ) : (
                <>
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                  <Text className="text-red-600 dark:text-red-400 font-semibold ml-2">
                    Reject
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleVerification("approved")}
              disabled={verifyCompletionMutation.isPending}
              className="flex-1 bg-green-100 dark:bg-green-900/30 py-4 rounded-2xl flex-row items-center justify-center"
            >
              {verifyCompletionMutation.isPending ? (
                <View className="w-5 h-5 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text className="text-green-600 dark:text-green-400 font-semibold ml-2">
                    Approve
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
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
                Admin Review
              </ThemedText>
            </View>
            <View className="w-10" />
          </View>
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {pendingCompletions.length === 0
              ? "No completions pending admin review"
              : `${pendingCompletions.length} completion${pendingCompletions.length > 1 ? "s" : ""} awaiting admin verification`}
          </ThemedText>
        </View>

        <ScrollView className="flex-1 px-6 py-6">
          {pendingCompletions.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons
                name="checkmark-done-circle-outline"
                size={64}
                color="#10b981"
              />
              <ThemedText className="text-center text-gray-500 mt-4 text-lg font-medium">
                All verified!
              </ThemedText>
              <ThemedText className="text-center text-gray-400 mt-2 text-sm">
                No completions pending verification
              </ThemedText>
            </View>
          ) : (
            <View>
              {pendingCompletions.map((completion) => (
                <View
                  key={completion.completionId}
                  className="bg-white dark:bg-neutral-900 rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 dark:border-neutral-800"
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <ThemedText className="text-lg font-bold mb-1 text-gray-700 dark:text-gray-300">
                        {(completion as CompletionWithChoreInfo).choreName ||
                          "Chore"}
                      </ThemedText>
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="person" size={16} color="#6b7280" />
                        <ThemedText className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                          Completed by{" "}
                          {(completion as CompletionWithChoreInfo)
                            .completedBy || "Unknown"}
                        </ThemedText>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="time" size={16} color="#6b7280" />
                        <ThemedText className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                          {formatDistance(
                            new Date(completion.completedAt),
                            new Date(),
                            { addSuffix: true }
                          )}
                        </ThemedText>
                      </View>
                    </View>

                    <View className="flex-row items-center bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                      <Ionicons name="hourglass" size={14} color="#f59e0b" />
                      <ThemedText className="text-xs font-medium text-yellow-700 dark:text-yellow-300 ml-1">
                        Pending
                      </ThemedText>
                    </View>
                  </View>

                  {completion.photoUrl && (
                    <View className="mb-3">
                      <Image
                        source={{ uri: completion.photoUrl }}
                        className="w-full h-32 rounded-xl"
                        resizeMode="cover"
                      />
                    </View>
                  )}

                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedCompletion(
                          completion as CompletionWithChoreInfo
                        );
                        Alert.alert(
                          "Reject Completion",
                          "Are you sure you want to reject this completion?",
                          [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Reject",
                              style: "destructive",
                              onPress: () => handleVerification("rejected"),
                            },
                          ]
                        );
                      }}
                      className="flex-1 bg-red-50 dark:bg-red-900/20 py-3 rounded-xl flex-row items-center justify-center"
                    >
                      <Ionicons name="close-circle" size={18} color="#ef4444" />
                      <Text className="text-red-600 dark:text-red-400 font-medium ml-2">
                        Reject
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        startVerification(completion as CompletionWithChoreInfo)
                      }
                      className="flex-1 bg-green-50 dark:bg-green-900/20 py-3 rounded-xl flex-row items-center justify-center"
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#10b981"
                      />
                      <Text className="text-green-600 dark:text-green-400 font-medium ml-2">
                        Review
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};
