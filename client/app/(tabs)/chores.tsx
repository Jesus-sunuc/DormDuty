import {
  useChoresAssignedToUserQuery,
  useChoresAssignedWithStatusQuery,
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

  const {
    data: choreData,
    isLoading: statusLoading,
    error: statusError,
  } = useChoresAssignedWithStatusQuery();

  const chores = choreData?.chores?.length ? choreData.chores : assignedChores;
  const isLoading = assignedLoading || statusLoading;
  const finalError = error || statusError;

  const roomId =
    selectedRoomId || chores[0]?.roomId || assignedChores[0]?.roomId || 0;
  const { data: membership } = useMembershipQuery(user?.userId || 0, roomId);

  const { hasPermission } = usePermissions(roomId);
  const canVerify = hasPermission(Role.ADMIN);

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

        <ParallaxScrollViewY>
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
                const isPendingCompletion = pendingCompletions.some(
                  (comp) => comp.choreId === chore.choreId
                );

                return (
                  <View key={chore.choreId} className="mb-4">
                    <Pressable
                      onPress={() =>
                        router.push(`/chore-details/${chore.choreId}`)
                      }
                      className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden"
                    >
                      <View className="p-5 pb-3">
                        <View className="flex-row items-start justify-between mb-4">
                          <View className="flex-1 mr-4">
                            <View className="flex-row items-center mb-2">
                              <View
                                style={{
                                  backgroundColor: getRoomColor(chore.roomId),
                                }}
                                className="w-3 h-3 rounded-full mr-3"
                              />
                              <ThemedText className="text-xl font-bold text-gray-900 dark:text-white">
                                {chore.name}
                              </ThemedText>
                            </View>
                          </View>

                          <View className="ml-2">
                            {isPendingCompletion ? (
                              <View className="px-4 py-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 flex-row items-center">
                                <Ionicons
                                  name="hourglass"
                                  size={16}
                                  color="#f59e0b"
                                />
                                <ThemedText className="text-amber-700 dark:text-amber-300 text-sm font-medium ml-2">
                                  Pending
                                </ThemedText>
                              </View>
                            ) : (chore as any).rejectionInfo ? (
                              <View className="px-4 py-2.5 rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 flex-row items-center">
                                <Ionicons
                                  name="close-circle"
                                  size={16}
                                  color="#dc2626"
                                />
                                <ThemedText className="text-red-700 dark:text-red-300 text-sm font-medium ml-2">
                                  Rejected
                                </ThemedText>
                              </View>
                            ) : (
                              <TouchableOpacity
                                onPress={() => handleCompleteChore(chore)}
                                disabled={completeChoreeMutation.isPending}
                                className={`px-5 py-3 rounded-xl flex-row items-center shadow-sm ${
                                  completeChoreeMutation.isPending
                                    ? "bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700"
                                    : "bg-emerald-500 dark:bg-emerald-600"
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

                        <View className="flex-row items-center space-x-6">
                          <View className="flex-row items-center flex-1">
                            <View className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mr-3">
                              <Ionicons
                                name="time-outline"
                                size={16}
                                color="#f59e0b"
                              />
                            </View>
                            <View className="flex-1">
                              <ThemedText className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                                Last completed
                              </ThemedText>
                              <ThemedText className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                                {formatDate(chore.lastCompleted)}
                              </ThemedText>
                            </View>
                          </View>

                          <View className="flex-row items-center flex-1">
                            <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-3">
                              <Ionicons
                                name="alarm-outline"
                                size={16}
                                color="#3b82f6"
                              />
                            </View>
                            <View className="flex-1">
                              <ThemedText className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                                Due at
                              </ThemedText>
                              <View className="flex-row items-center mt-0.5">
                                <View className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                                <ThemedText className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {chore.timing || "Not set"}
                                </ThemedText>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>

                      {(chore as any).rejectionInfo && (
                        <View className="mx-5 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                          <View className="flex-row items-center">
                            <Ionicons
                              name="close-circle-outline"
                              size={16}
                              color="#dc2626"
                            />
                            <ThemedText className="text-sm text-red-700 dark:text-red-300 ml-2 font-medium">
                              Completion rejected • Click to view details
                            </ThemedText>
                          </View>
                        </View>
                      )}

                      {isPendingCompletion && (
                        <View className="mx-5 mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
                          <View className="flex-row items-center">
                            <Ionicons
                              name="hourglass-outline"
                              size={16}
                              color="#f59e0b"
                            />
                            <ThemedText className="text-sm text-yellow-700 dark:text-yellow-300 ml-2 font-medium">
                              Completion pending verification
                            </ThemedText>
                          </View>
                        </View>
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </ParallaxScrollViewY>

        {canVerify && membership && (
          <ChoreVerificationModalWrapper
            isVisible={showVerificationModal}
            onClose={() => setShowVerificationModal(false)}
            completions={pendingCompletions}
            verifierMembershipId={membership.membershipId}
            isAdmin={hasPermission(Role.ADMIN)}
          />
        )}

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
