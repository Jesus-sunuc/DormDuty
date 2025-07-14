import React from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatDistance } from "date-fns";
import { ChoreSwapRequest } from "@/models/ChoreSwapRequest";
import { ChoreCompletion } from "@/models/Chore";

interface ExtendedChoreCompletion extends ChoreCompletion {
  choreName?: string;
  completedBy?: string;
}

interface RoomNotificationModalProps {
  isVisible: boolean;
  onClose: () => void;
  swapRequests: ChoreSwapRequest[];
  pendingCompletions: ExtendedChoreCompletion[];
  onSwapRequestAction: () => void;
  onVerificationAction: () => void;
  isAdmin: boolean;
  currentMembershipId?: number;
}

export const RoomNotificationModal: React.FC<RoomNotificationModalProps> = ({
  isVisible,
  onClose,
  swapRequests,
  pendingCompletions,
  onSwapRequestAction,
  onVerificationAction,
  isAdmin,
  currentMembershipId,
}) => {
  const colorScheme = useColorScheme();

  // Filter swap requests for current user
  const relevantSwapRequests = swapRequests.filter(
    (request) =>
      request.status === "pending" &&
      request.toMembership === currentMembershipId
  );

  // Only admins see verification requests
  const relevantCompletions = isAdmin ? pendingCompletions : [];

  const totalNotifications =
    relevantSwapRequests.length + relevantCompletions.length;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50 dark:bg-black">
        {/* Header */}
        <View className="bg-white dark:bg-neutral-900 px-6 pt-12 pb-6 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <ThemedText className="text-2xl font-bold text-gray-900 dark:text-white">
                Notifications
              </ThemedText>
              <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {totalNotifications === 0
                  ? "All caught up!"
                  : `${totalNotifications} notification${totalNotifications !== 1 ? "s" : ""}`}
              </ThemedText>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center"
            >
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 py-4">
          {/* Swap Requests Section */}
          {relevantSwapRequests.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-3">
                  <Ionicons name="swap-horizontal" size={16} color="#3b82f6" />
                </View>
                <ThemedText className="text-lg font-semibold text-gray-900 dark:text-white">
                  Chore Swap Requests
                </ThemedText>
                <View className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <ThemedText className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    {relevantSwapRequests.length}
                  </ThemedText>
                </View>
              </View>

              {relevantSwapRequests.map((request) => (
                <TouchableOpacity
                  key={request.swapId}
                  onPress={onSwapRequestAction}
                  className="bg-white dark:bg-neutral-900 rounded-xl p-4 mb-3 border border-blue-200 dark:border-blue-800"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <ThemedText className="text-base font-medium text-gray-900 dark:text-white mb-1">
                        {request.fromUserName} wants to swap
                      </ThemedText>
                      <ThemedText className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        Chore: {request.choreName}
                      </ThemedText>
                      <ThemedText className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistance(
                          new Date(request.requestedAt),
                          new Date(),
                          {
                            addSuffix: true,
                          }
                        )}
                      </ThemedText>
                    </View>
                    <View className="ml-3">
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="#9ca3af"
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Verification Requests Section */}
          {relevantCompletions.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mr-3">
                  <Ionicons name="checkmark-circle" size={16} color="#f97316" />
                </View>
                <ThemedText className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pending Verifications
                </ThemedText>
                <View className="ml-2 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <ThemedText className="text-xs font-medium text-orange-600 dark:text-orange-400">
                    {relevantCompletions.length}
                  </ThemedText>
                </View>
              </View>

              {relevantCompletions.map((completion) => (
                <TouchableOpacity
                  key={completion.completionId}
                  onPress={onVerificationAction}
                  className="bg-white dark:bg-neutral-900 rounded-xl p-4 mb-3 border border-orange-200 dark:border-orange-800"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <ThemedText className="text-base font-medium text-gray-900 dark:text-white mb-1">
                        {completion.completedBy
                          ? `${completion.completedBy} completed a chore`
                          : "Chore completion awaiting verification"}
                      </ThemedText>
                      <ThemedText className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {completion.choreName
                          ? `Chore: ${completion.choreName}`
                          : `Chore ID: ${completion.choreId}`}
                      </ThemedText>
                      <View className="flex-row items-center">
                        {completion.photoUrl && (
                          <View className="flex-row items-center mr-3">
                            <Ionicons name="camera" size={12} color="#f97316" />
                            <ThemedText className="text-xs text-orange-600 dark:text-orange-400 ml-1">
                              Photo included
                            </ThemedText>
                          </View>
                        )}
                        <ThemedText className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistance(
                            new Date(completion.completedAt),
                            new Date(),
                            {
                              addSuffix: true,
                            }
                          )}
                        </ThemedText>
                      </View>
                    </View>
                    <View className="ml-3">
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="#9ca3af"
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Empty State */}
          {totalNotifications === 0 && (
            <View className="flex-1 items-center justify-center py-20">
              <View className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mb-4">
                <Ionicons name="checkmark-circle" size={32} color="#10b981" />
              </View>
              <ThemedText className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                All caught up!
              </ThemedText>
              <ThemedText className="text-center text-gray-500 dark:text-gray-400 px-8">
                No pending notifications at the moment. Check back later for new
                chore requests and completions.
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};
