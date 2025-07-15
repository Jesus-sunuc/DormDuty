import {
  useChoresAssignedToUserQuery,
  useChoresAssignedWithStatusQuery,
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
import { ChoreVerificationModalWrapper } from "@/components/chores/ChoreVerificationModalWrapper";
import { Chore, ChoreWithCompletionStatus } from "@/models/Chore";
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

  // Get chores with status filtering (approved filtered out, rejections included)
  const {
    data: choreData,
    isLoading: statusLoading,
    error: statusError,
  } = useChoresAssignedWithStatusQuery();

  // Use the filtered data if available, fallback to original
  const chores = choreData?.chores?.length ? choreData.chores : assignedChores;
  const rejectedCompletions = choreData?.rejectedCompletions || [];
  const isLoading = assignedLoading || statusLoading;
  const finalError = error || statusError;

  // Get membership for completion and room access
  // Use room from chores, or fallback to the first available room
  const roomId =
    selectedRoomId || chores[0]?.roomId || assignedChores[0]?.roomId || 0;
  const { data: membership } = useMembershipQuery(user?.userId || 0, roomId);

  // Check permissions for verification access (admin only)
  const { hasPermission } = usePermissions(roomId);
  const canVerify = hasPermission(Role.ADMIN);

  // Get pending completions for verification
  const { data: pendingCompletions = [] } =
    usePendingCompletionsByRoomQuery(roomId);

  const completeChoreeMutation = useCompleteChoreMutation();
  const router = useRouter();

  const shouldShowLoading = !user || isLoading;

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
      error={finalError}
      loadingText="Loading your chores..."
    >
      <View className="flex-1 bg-gray-50 dark:bg-black">
        <Header title="My Chores" onMenuPress={openSidebar} />

        {/* Rejected Completions Notification */}
        {rejectedCompletions.length > 0 && (
          <View className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <View className="flex-row items-center mb-2">
              <Ionicons name="alert-circle" size={20} color="#dc2626" />
              <ThemedText className="text-red-700 dark:text-red-300 ml-2 font-semibold">
                {rejectedCompletions.length} chore completion
                {rejectedCompletions.length > 1 ? "s" : ""} rejected
              </ThemedText>
            </View>
            <ThemedText className="text-red-600 dark:text-red-400 text-sm">
              Your recent chore completions were not approved. Please check and
              resubmit if needed.
            </ThemedText>
          </View>
        )}

        <ParallaxScrollViewY>
          {/* Verification Banner */}
          {canVerify && pendingCompletions.length > 0 && (
            <PendingVerificationsBanner
              pendingCount={pendingCompletions.length}
              onPress={() => setShowVerificationModal(true)}
            />
          )}

          {chores.length === 0 ? (
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
              {chores.map((chore) => {
                // Check if this chore has pending completions in the pending completions list
                const isPendingCompletion = pendingCompletions.some(
                  (comp) => comp.choreId === chore.choreId
                );

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
                            <View className="px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 flex-row items-center">
                              <Ionicons
                                name="hourglass"
                                size={16}
                                color="#f59e0b"
                              />
                              <ThemedText className="text-amber-700 dark:text-amber-300 text-sm font-medium ml-2">
                                Pending
                              </ThemedText>
                            </View>
                          ) : (
                            <TouchableOpacity
                              onPress={() => handleCompleteChore(chore)}
                              disabled={completeChoreeMutation.isPending}
                              className={`px-5 py-3 rounded-full flex-row items-center shadow-sm ${
                                completeChoreeMutation.isPending
                                  ? "bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700"
                                  : "bg-emerald-500 dark:bg-emerald-600 border border-emerald-600 dark:border-emerald-700"
                              }`}
                            >
                              {completeChoreeMutation.isPending ? (
                                <>
                                  <View className="w-4 h-4 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin mr-2" />
                                  <ThemedText className="text-gray-600 dark:text-gray-400 text-sm font-semibold">
                                    Completing...
                                  </ThemedText>
                                </>
                              ) : (
                                <>
                                  <Ionicons
                                    name="checkmark-circle"
                                    size={18}
                                    color="white"
                                  />
                                  <ThemedText className="text-white text-sm font-semibold ml-2">
                                    Mark Done
                                  </ThemedText>
                                </>
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
          <ChoreVerificationModalWrapper
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
