import React from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatDistance } from "date-fns";
import { ChoreSwapRequest } from "@/models/ChoreSwapRequest";
import { ChoreCompletion } from "@/models/Chore";

interface ExtendedChoreCompletion extends ChoreCompletion {
  choreName?: string;
  completedBy?: string;
}

interface RoomNotificationPageProps {
  swapRequests: ChoreSwapRequest[];
  pendingCompletions: ExtendedChoreCompletion[];
  onSwapRequestAction: () => void;
  onVerificationAction: () => void;
  isAdmin: boolean;
  currentMembershipId?: number;
  roomId: string;
}

export const RoomNotificationPage: React.FC<RoomNotificationPageProps> = ({
  swapRequests,
  pendingCompletions,
  onSwapRequestAction,
  onVerificationAction,
  isAdmin,
  currentMembershipId,
  roomId,
}) => {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const relevantSwapRequests = swapRequests.filter(
    (request: ChoreSwapRequest) =>
      request.status === "pending" &&
      request.toMembership === currentMembershipId
  );

  const relevantCompletions = isAdmin ? pendingCompletions : [];

  const totalNotifications =
    relevantSwapRequests.length + relevantCompletions.length;

  return (
    <ScrollView className="flex-1 px-6 py-6">
      {relevantSwapRequests.length > 0 && (
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-3">
              <Ionicons name="swap-horizontal" size={16} color="#3b82f6" />
            </View>
            <ThemedText className="text-lg font-semibold text-gray-800 dark:text-white">
              Chore Swap Requests
            </ThemedText>
            <View className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <ThemedText className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {relevantSwapRequests.length}
              </ThemedText>
            </View>
          </View>

          {relevantSwapRequests.map((request: ChoreSwapRequest) => (
            <TouchableOpacity
              key={request.swapId}
              onPress={onSwapRequestAction}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-5 mb-4 border border-gray-200 dark:border-neutral-800 border-l-4 border-l-blue-500"
            >
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-3">
                  <Ionicons name="person" size={18} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <ThemedText className="text-base font-semibold text-gray-800 dark:text-white">
                    {request.fromUserName} wants to swap
                  </ThemedText>
                  <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDistance(new Date(request.requestedAt), new Date(), {
                      addSuffix: true,
                    })}
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
              </View>
              <View className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <ThemedText className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Chore: {request.choreName}
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {relevantCompletions.length > 0 && (
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mr-3">
              <Ionicons name="checkmark-circle" size={16} color="#f97316" />
            </View>
            <ThemedText className="text-lg font-semibold text-gray-800 dark:text-white">
              Pending Verifications
            </ThemedText>
            <View className="ml-2 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <ThemedText className="text-xs font-medium text-orange-600 dark:text-orange-400">
                {relevantCompletions.length}
              </ThemedText>
            </View>
          </View>

          {relevantCompletions.map((completion: ExtendedChoreCompletion) => (
            <TouchableOpacity
              key={completion.completionId}
              onPress={() =>
                router.push(
                  `/(tabs)/rooms/${roomId}/verifications/${completion.completionId}`
                )
              }
              className="bg-white dark:bg-neutral-900 rounded-2xl p-5 mb-4 border border-gray-200 dark:border-neutral-800 border-l-4 border-l-orange-500"
            >
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mr-3">
                  <Ionicons name="checkmark" size={18} color="#f97316" />
                </View>
                <View className="flex-1">
                  <ThemedText className="text-base font-semibold text-gray-800 dark:text-white">
                    {completion.completedBy
                      ? `${completion.completedBy} completed a chore`
                      : "Chore completion pending"}
                  </ThemedText>
                  <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDistance(
                      new Date(completion.completedAt),
                      new Date(),
                      { addSuffix: true }
                    )}
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#f97316" />
              </View>
              <View className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                <View className="flex-row items-center justify-between">
                  <ThemedText className="text-sm font-medium text-orange-800 dark:text-orange-300">
                    {completion.choreName
                      ? `Chore: ${completion.choreName}`
                      : `Chore ID: ${completion.choreId}`}
                  </ThemedText>
                  {completion.photoUrl && (
                    <View className="flex-row items-center">
                      <Ionicons name="camera" size={14} color="#f97316" />
                      <ThemedText className="text-xs text-orange-600 dark:text-orange-400 ml-1">
                        Photo
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {totalNotifications === 0 && (
        <View className="flex-1 items-center justify-center py-20">
          <View className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mb-4">
            <Ionicons name="checkmark-circle" size={32} color="#10b981" />
          </View>
          <ThemedText className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            All caught up!
          </ThemedText>
          <ThemedText className="text-center text-gray-600 dark:text-gray-400 px-8">
            No pending notifications at the moment. Check back later for new
            chore requests and completions.
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );
};
