import {
  useChoresAssignedToUserQuery,
  useChoresWithCompletionStatusQuery,
  useCompleteChoreMutation,
  usePendingCompletionsByRoomQuery,
} from "@/hooks/choreHooks";
import { useMembershipQuery } from "@/hooks/membershipHooks";
import { View, Pressable, TouchableOpacity, Alert } from "react-native";
import { formatDistance } from "date-fns";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getRoomColor } from "@/utils/colorUtils";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import ParallaxScrollViewY from "@/components/ParallaxScrollViewY";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/user/useAuth";
import { Header } from "@/components/ui/Header";
import { useSidebar } from "@/hooks/useSidebar";
import { useState } from "react";
import { ChoreVerificationModal } from "@/components/chores/ChoreVerificationModal";
import { Chore } from "@/models/Chore";
import { PendingVerificationsBanner } from "@/components/chores/PendingVerificationsBanner";
import { ChoreCompletionModal } from "@/components/chores/ChoreCompletionModal";
import { usePermissions } from "@/hooks/usePermissions";
import { Role } from "@/models/Membership";

export default function ChoresScreen() {
  const { user } = useAuth();
  const { openSidebar } = useSidebar();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedChoreForCompletion, setSelectedChoreForCompletion] =
    useState<Chore | null>(null);

  const {
    data: assignedChores = [],
    isLoading: assignedLoading,
    error,
  } = useChoresAssignedToUserQuery();

  // Get membership for completion and room access
  const roomId = selectedRoomId || assignedChores[0]?.roomId || 0;
  const { data: membership } = useMembershipQuery(user?.userId || 0, roomId);

  // Check permissions for verification access (admin only)
  const { hasPermission } = usePermissions(roomId);
  const canVerify = hasPermission(Role.ADMIN);

  // Get pending completions for verification
  const { data: pendingCompletions = [] } =
    usePendingCompletionsByRoomQuery(roomId);

  const completeChoreeMutation = useCompleteChoreMutation();
  const router = useRouter();

  const shouldShowLoading = !user || assignedLoading;

  const handleCompleteChore = async (chore: Chore) => {
    if (!membership?.membershipId) {
      Alert.alert("Error", "Unable to complete chore. Please try again.");
      return;
    }

    setSelectedChoreForCompletion(chore);
    setShowCompletionModal(true);
  };

  return (
    <LoadingAndErrorHandling
      isLoading={shouldShowLoading}
      error={error}
      loadingText="Loading your chores..."
    >
      <View className="flex-1 bg-gray-50 dark:bg-black">
        <Header title="My Chores" onMenuPress={openSidebar} />
        <ParallaxScrollViewY>
          {/* Verification Banner */}
          {canVerify && pendingCompletions.length > 0 && (
            <PendingVerificationsBanner
              pendingCount={pendingCompletions.length}
              onPress={() => setShowVerificationModal(true)}
            />
          )}

          {assignedChores.length === 0 ? (
            <View className="flex-1 items-center justify-center px-6 py-20">
              <Ionicons
                name="checkmark-circle-outline"
                size={64}
                color="#9ca3af"
              />
              <ThemedText className="text-center text-gray-400 mt-4 text-lg font-medium">
                No chores assigned yet
              </ThemedText>
              <ThemedText className="text-center text-gray-500 mt-2 text-sm">
                You're all caught up! New chores will appear here when assigned.
              </ThemedText>
            </View>
          ) : (
            <View className="px-6 pt-6">
              {assignedChores.map((chore) => {
                const isPendingCompletion = false; // TODO: Check if pending completion exists

                return (
                  <View key={chore.choreId} className="mb-4">
                    <View className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden">
                      <View className="flex-row items-center">
                        <View
                          style={{
                            backgroundColor: getRoomColor(chore.roomId),
                          }}
                          className="w-1 h-20"
                        />

                        <Pressable
                          onPress={() =>
                            router.push(`/chore-details/${chore.choreId}`)
                          }
                          className="flex-1 p-5"
                        >
                          <ThemedText className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-300">
                            {chore.name}
                          </ThemedText>

                          <View className="space-y-2">
                            <View className="flex-row items-center justify-between">
                              <View className="flex-row items-center">
                                <View className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mr-2">
                                  <Ionicons
                                    name="time-outline"
                                    size={12}
                                    color="#f59e0b"
                                  />
                                </View>
                                <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                                  Last completed:
                                </ThemedText>
                              </View>
                              <ThemedText className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {formatDate(chore.lastCompleted)}
                              </ThemedText>
                            </View>

                            <View className="flex-row items-center justify-between">
                              <View className="flex-row items-center">
                                <View className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-2">
                                  <Ionicons
                                    name="alarm-outline"
                                    size={12}
                                    color="#3b82f6"
                                  />
                                </View>
                                <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                                  Due at:
                                </ThemedText>
                              </View>
                              <View className="flex-row items-center">
                                <View className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                                <ThemedText className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {chore.timing || "Not set"}
                                </ThemedText>
                              </View>
                            </View>

                            {isPendingCompletion && (
                              <View className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <View className="flex-row items-center">
                                  <Ionicons
                                    name="hourglass-outline"
                                    size={16}
                                    color="#f59e0b"
                                  />
                                  <ThemedText className="text-sm text-yellow-700 dark:text-yellow-300 ml-2">
                                    Completion pending verification
                                  </ThemedText>
                                </View>
                              </View>
                            )}
                          </View>
                        </Pressable>

                        <View className="px-4">
                          {isPendingCompletion ? (
                            <View className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 items-center justify-center">
                              <Ionicons
                                name="hourglass"
                                size={20}
                                color="#f59e0b"
                              />
                            </View>
                          ) : (
                            <TouchableOpacity
                              onPress={() => handleCompleteChore(chore)}
                              disabled={completeChoreeMutation.isPending}
                              className={`w-12 h-12 rounded-full items-center justify-center ${
                                completeChoreeMutation.isPending
                                  ? "bg-gray-100 dark:bg-neutral-800"
                                  : "bg-green-100 dark:bg-green-900/30"
                              }`}
                            >
                              {completeChoreeMutation.isPending ? (
                                <View className="w-5 h-5 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin" />
                              ) : (
                                <Ionicons
                                  name="checkmark-circle"
                                  size={24}
                                  color="#10b981"
                                />
                              )}
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ParallaxScrollViewY>

        {/* Verification Modal */}
        {canVerify && membership && (
          <ChoreVerificationModal
            isVisible={showVerificationModal}
            onClose={() => setShowVerificationModal(false)}
            completions={pendingCompletions}
            verifierMembershipId={membership.membershipId}
            isAdmin={hasPermission(Role.ADMIN)}
          />
        )}

        {/* Completion Modal */}
        {selectedChoreForCompletion && membership && (
          <ChoreCompletionModal
            isVisible={showCompletionModal}
            onClose={() => {
              setShowCompletionModal(false);
              setSelectedChoreForCompletion(null);
            }}
            chore={selectedChoreForCompletion}
            membershipId={membership.membershipId}
          />
        )}
      </View>
    </LoadingAndErrorHandling>
  );
}

export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "Never";
  return formatDistance(new Date(dateString), new Date(), {
    addSuffix: true,
  });
};
