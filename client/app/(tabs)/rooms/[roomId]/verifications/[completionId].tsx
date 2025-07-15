import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  Alert,
  TextInput,
  Image,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemedText } from "@/components/ThemedText";
import {
  usePendingCompletionsByRoomQuery,
  useVerifyCompletionMutation,
} from "@/hooks/choreHooks";
import { useMembershipQuery } from "@/hooks/membershipHooks";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/user/useAuth";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import { Role } from "@/models/Membership";
import {
  ChoreCompletion,
} from "@/models/Chore";
import { toastError, toastSuccess } from "@/components/ToastService";
import { formatDistance } from "date-fns";

interface ExtendedChoreCompletion extends ChoreCompletion {
  choreName?: string;
  completedBy?: string;
}

const CompletionReviewScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const [verificationComment, setVerificationComment] = useState("");

  const roomId = Array.isArray(params.roomId)
    ? params.roomId[0]
    : typeof params.roomId === "string"
      ? params.roomId
      : undefined;

  const completionId = Array.isArray(params.completionId)
    ? parseInt(params.completionId[0], 10)
    : typeof params.completionId === "string"
      ? parseInt(params.completionId, 10)
      : undefined;

  const roomIdNum = roomId ? parseInt(roomId, 10) : 0;
  const permissions = usePermissions(isNaN(roomIdNum) ? 0 : roomIdNum);

  const { data: pendingCompletions = [] } =
    usePendingCompletionsByRoomQuery(roomIdNum);
  const { data: membership } = useMembershipQuery(user?.userId || 0, roomIdNum);
  const verifyCompletionMutation = useVerifyCompletionMutation();

  const canVerify = permissions.hasPermission(Role.ADMIN);

  // Find the specific completion
  const completion = pendingCompletions.find(
    (comp) => comp.completionId === completionId
  ) as ExtendedChoreCompletion | undefined;

  const handleApprove = async () => {
    if (!membership || !completion) return;

    try {
      await verifyCompletionMutation.mutateAsync({
        completionId: completion.completionId,
        membershipId: membership.membershipId,
        verificationRequest: {
          completionId: completion.completionId,
          verificationType: "approved",
          comment: verificationComment.trim() || undefined,
        },
      });

      toastSuccess("Chore completion approved!");
      router.back();
    } catch (error) {
      toastError("Failed to approve completion");
    }
  };

  const handleReject = async () => {
    if (!membership || !completion) return;

    Alert.alert(
      "Reject Completion",
      "Are you sure you want to reject this chore completion?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            try {
              await verifyCompletionMutation.mutateAsync({
                completionId: completion.completionId,
                membershipId: membership.membershipId,
                verificationRequest: {
                  completionId: completion.completionId,
                  verificationType: "rejected",
                  comment: verificationComment.trim() || "Completion rejected",
                },
              });

              toastSuccess("Chore completion rejected");
              router.back();
            } catch (error) {
              toastError("Failed to reject completion");
            }
          },
        },
      ]
    );
  };

  if (!roomId || !completionId || !canVerify || !membership || !completion) {
    return (
      <LoadingAndErrorHandling>
        <></>
      </LoadingAndErrorHandling>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-neutral-950">
      {/* Header */}
      <View className="bg-gray-50 dark:bg-neutral-950 px-6 pt-14 pb-4 border-b border-gray-200 dark:border-neutral-800">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-neutral-800 items-center justify-center mr-4"
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={colorScheme === "dark" ? "#d1d5db" : "#4b5563"}
            />
          </TouchableOpacity>
          <ThemedText className="text-xl font-bold text-gray-900 dark:text-white">
            Review Completion
          </ThemedText>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-6">
        {/* Completion Details Card */}
        <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-4">
              <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <ThemedText className="text-xl font-bold text-gray-900 dark:text-white">
                {completion.choreName || `Chore #${completion.choreId}`}
              </ThemedText>
              <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                Completed by {completion.completedBy || "Unknown"} •{" "}
                {formatDistance(new Date(completion.completedAt), new Date(), {
                  addSuffix: true,
                })}
              </ThemedText>
            </View>
          </View>

          {/* Completion Photo Section */}
          <View className="mb-6">
            <ThemedText className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Completion Photo:
            </ThemedText>
            <View className="bg-gray-100 dark:bg-neutral-800 rounded-2xl p-8 items-center justify-center min-h-[200px]">
              {completion.photoUrl ? (
                <Image
                  source={{ uri: completion.photoUrl }}
                  className="w-full h-48 rounded-xl"
                  resizeMode="cover"
                />
              ) : (
                <View className="items-center">
                  <Ionicons
                    name="camera-outline"
                    size={32}
                    color={colorScheme === "dark" ? "#6b7280" : "#9ca3af"}
                  />
                  <ThemedText className="text-gray-500 dark:text-gray-400 mt-2">
                    Photo will be displayed here
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Verification Notes Section */}
        <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 shadow-sm">
          <ThemedText className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Add Verification Notes
          </ThemedText>
          <TextInput
            value={verificationComment}
            onChangeText={setVerificationComment}
            placeholder="Optional comments about this completion..."
            placeholderTextColor={
              colorScheme === "dark" ? "#9ca3af" : "#6b7280"
            }
            multiline
            numberOfLines={4}
            className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-700 min-h-[100px]"
            textAlignVertical="top"
          />
        </View>

        {/* Action Buttons */}
        <View className="flex-row space-x-4 pb-8">
          <TouchableOpacity
            onPress={handleReject}
            disabled={verifyCompletionMutation.isPending}
            className="flex-1 bg-red-500 dark:bg-red-600 rounded-2xl py-4 flex-row items-center justify-center shadow-sm"
          >
            <Ionicons name="close" size={20} color="white" />
            <ThemedText className="text-white font-bold ml-2 text-lg">
              Reject
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleApprove}
            disabled={verifyCompletionMutation.isPending}
            className="flex-1 bg-green-500 dark:bg-green-600 rounded-2xl py-4 flex-row items-center justify-center shadow-sm"
          >
            <Ionicons name="checkmark" size={20} color="white" />
            <ThemedText className="text-white font-bold ml-2 text-lg">
              Approve
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default CompletionReviewScreen;
