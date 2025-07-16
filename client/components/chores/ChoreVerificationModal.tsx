import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import { ChoreCompletion } from "@/models/Chore";
import { ThemedText } from "@/components/ThemedText";
import { useVerifyCompletionMutation } from "@/hooks/choreHooks";
import { toastError, toastSuccess } from "@/components/ToastService";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import Ionicons from "@expo/vector-icons/Ionicons";

interface CompletionWithChoreInfo extends ChoreCompletion {
  choreName?: string;
  completedBy?: string;
  roomId?: number;
}

interface ChoreVerificationModalProps {
  isVisible: boolean;
  onClose: () => void;
  completions: ChoreCompletion[];
  verifierMembershipId: number;
  isAdmin?: boolean;
}

interface CompletionDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  completion: CompletionWithChoreInfo | null;
  onApprove: (comment?: string) => void;
  onReject: (comment?: string) => void;
  isLoading?: boolean;
}

const CompletionDetailsModal: React.FC<CompletionDetailsModalProps> = ({
  isVisible,
  onClose,
  completion,
  onApprove,
  onReject,
  isLoading = false,
}) => {
  const [verificationComment, setVerificationComment] = useState("");
  const [showRejectConfirmation, setShowRejectConfirmation] = useState(false);

  if (!completion) return null;

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-gray-50 dark:bg-black">
        <View className="bg-white dark:bg-neutral-900 px-6 pt-12 pb-6 shadow-lg">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={20} color="#6b7280" />
            </TouchableOpacity>
            <View className="flex-1 mx-4">
              <Text className="text-lg font-semibold text-center text-gray-700 dark:text-gray-300">
                Review Completion
              </Text>
            </View>
            <View className="w-10" />
          </View>
        </View>

        <ScrollView className="flex-1 px-6 py-6">
          <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 ">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-4">
                <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                  {completion.choreName || "Chore"}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Completed by {completion.completedBy || "User"} • Just now
                </Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Completion Photo:
              </Text>
              <View className="w-full h-48 rounded-xl bg-gray-200 dark:bg-neutral-700 flex items-center justify-center">
                <Text className="text-gray-500 dark:text-gray-400">
                  📷 Photo will be displayed here
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 ">
            <Text className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
              Add Verification Notes
            </Text>
            <TextInput
              value={verificationComment}
              onChangeText={setVerificationComment}
              placeholder="Optional comments about this completion..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 text-gray-900 dark:text-white min-h-[100px]"
              style={{ textAlignVertical: "top" }}
            />
          </View>

          <View className="flex-row gap-4 mb-8">
            <TouchableOpacity
              onPress={() => setShowRejectConfirmation(true)}
              disabled={isLoading}
              className="flex-1 bg-red-50 dark:bg-red-900/20 py-4 rounded-xl flex-row items-center justify-center"
            >
              {isLoading ? (
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
              onPress={() => {
                Alert.alert(
                  "Approve Completion",
                  "Are you sure you want to approve this completion?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Approve",
                      onPress: () =>
                        onApprove(verificationComment.trim() || undefined),
                    },
                  ]
                );
              }}
              disabled={isLoading}
              className="flex-1 bg-green-50 dark:bg-green-900/20 py-4 rounded-xl flex-row items-center justify-center"
            >
              {isLoading ? (
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
        </ScrollView>
      </View>

      <ConfirmationModal
        visible={showRejectConfirmation}
        onClose={() => setShowRejectConfirmation(false)}
        onConfirm={() => {
          setShowRejectConfirmation(false);
          onReject(verificationComment.trim() || undefined);
        }}
        title="Reject Completion"
        message="Are you sure you want to reject this completion?"
        confirmText="Reject"
        cancelText="Cancel"
        destructive={true}
        icon="close-circle"
      />
    </Modal>
  );
};

export const ChoreVerificationModal: React.FC<ChoreVerificationModalProps> = ({
  isVisible,
  onClose,
  completions = [],
  verifierMembershipId,
}) => {
  const [selectedCompletion, setSelectedCompletion] =
    useState<CompletionWithChoreInfo | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showQuickRejectConfirmation, setShowQuickRejectConfirmation] =
    useState(false);
  const [completionToReject, setCompletionToReject] =
    useState<ChoreCompletion | null>(null);

  const verifyCompletionMutation = useVerifyCompletionMutation();

  const pendingCompletions = completions.filter(
    (c: ChoreCompletion) => c.status === "pending"
  );

  const handleReviewCompletion = (completion: ChoreCompletion) => {
    setSelectedCompletion(completion as CompletionWithChoreInfo);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedCompletion(null);
  };

  const handleApprove = async (comment?: string) => {
    if (!selectedCompletion) return;

    try {
      await verifyCompletionMutation.mutateAsync({
        completionId: selectedCompletion.completionId,
        membershipId: verifierMembershipId,
        verificationRequest: {
          completionId: selectedCompletion.completionId,
          verificationType: "approved",
          comment: comment || undefined,
        },
      });

      toastSuccess("Completion approved successfully!");
      handleCloseDetails();

      if (pendingCompletions.length <= 1) {
        onClose();
      }
    } catch (error) {
      toastError("Failed to approve completion");
    }
  };

  const handleReject = async (comment?: string) => {
    if (!selectedCompletion) return;

    try {
      await verifyCompletionMutation.mutateAsync({
        completionId: selectedCompletion.completionId,
        membershipId: verifierMembershipId,
        verificationRequest: {
          completionId: selectedCompletion.completionId,
          verificationType: "rejected",
          comment: comment || undefined,
        },
      });

      toastSuccess("Completion rejected successfully!");
      handleCloseDetails();

      if (pendingCompletions.length <= 1) {
        onClose();
      }
    } catch (error) {
      toastError("Failed to reject completion");
    }
  };

  const handleQuickReject = async (completion: ChoreCompletion) => {
    setCompletionToReject(completion);
    setShowQuickRejectConfirmation(true);
  };

  const confirmQuickReject = async () => {
    if (!completionToReject) return;

    try {
      await verifyCompletionMutation.mutateAsync({
        completionId: completionToReject.completionId,
        membershipId: verifierMembershipId,
        verificationRequest: {
          completionId: completionToReject.completionId,
          verificationType: "rejected",
          comment: undefined,
        },
      });

      toastSuccess("Completion rejected successfully!");
      setShowQuickRejectConfirmation(false);
      setCompletionToReject(null);

      if (pendingCompletions.length <= 1) {
        onClose();
      }
    } catch (error) {
      toastError("Failed to reject completion");
    }
  };

  return (
    <>
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
                  Pending Completions
                </ThemedText>
              </View>
              <View className="w-10" />
            </View>
          </View>

          <ScrollView className="flex-1 px-6 py-6">
            {pendingCompletions.length === 0 ? (
              <View className="flex-1 items-center justify-center py-12">
                <Ionicons name="checkmark-done" size={64} color="#10b981" />
                <Text className="text-lg font-medium text-gray-600 dark:text-gray-400 mt-4">
                  No pending completions
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-500 mt-2 text-center">
                  All chore completions have been reviewed.
                </Text>
              </View>
            ) : (
              <View>
                {pendingCompletions.map((completion: ChoreCompletion) => (
                  <View
                    key={completion.completionId}
                    className="bg-white dark:bg-neutral-900 rounded-2xl p-5 mb-4  border border-gray-100 dark:border-neutral-800"
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <ThemedText className="text-lg font-bold mb-1 text-gray-700 dark:text-gray-300">
                          Chore Completion #{completion.completionId}
                        </ThemedText>
                        <View className="flex-row items-center">
                          <Ionicons name="time" size={16} color="#6b7280" />
                          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                            Completed recently
                          </ThemedText>
                        </View>
                      </View>
                    </View>

                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        onPress={() => handleQuickReject(completion)}
                        className="flex-1 bg-red-50 dark:bg-red-900/20 py-3 rounded-xl flex-row items-center justify-center"
                      >
                        <Ionicons
                          name="close-circle"
                          size={18}
                          color="#ef4444"
                        />
                        <Text className="text-red-600 dark:text-red-400 font-medium ml-2">
                          Reject
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleReviewCompletion(completion)}
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

      {/* Separate details modal */}
      <CompletionDetailsModal
        isVisible={showDetailsModal}
        onClose={handleCloseDetails}
        completion={selectedCompletion}
        onApprove={handleApprove}
        onReject={handleReject}
        isLoading={verifyCompletionMutation.isPending}
      />

      <ConfirmationModal
        visible={showQuickRejectConfirmation}
        onClose={() => {
          setShowQuickRejectConfirmation(false);
          setCompletionToReject(null);
        }}
        onConfirm={confirmQuickReject}
        title="Reject Completion"
        message="Are you sure you want to reject this completion?"
        confirmText="Reject"
        cancelText="Cancel"
        destructive={true}
        icon="close-circle"
      />
    </>
  );
};
