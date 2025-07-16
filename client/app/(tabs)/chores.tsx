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
                  <View key={chore.choreId} className="mb-3">
                    <View className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
                      <Pressable
                        onPress={() =>
                          router.push(`/chore-details/${chore.choreId}`)
                        }
                        className="p-4"
                      >
                        <View className="flex-row items-center justify-between mb-3">
                          <View className="flex-row items-center flex-1">
                            <View
                              style={{
                                backgroundColor: getRoomColor(chore.roomId),
                              }}
                              className="w-2 h-2 rounded-full mr-2"
                            />
                            <ThemedText className="text-lg font-semibold text-gray-900 dark:text-white">
                              {chore.name}
                            </ThemedText>
                            {(chore as any).rejectionInfo && (
                              <View className="ml-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded">
                                <ThemedText className="text-xs text-red-600 dark:text-red-400 font-medium">
                                  [Rejected]
                                </ThemedText>
                              </View>
                            )}
                          </View>

                          {!isPendingCompletion && (
                            <TouchableOpacity
                              onPress={() => handleCompleteChore(chore)}
                              disabled={completeChoreeMutation.isPending}
                              className={`px-4 py-2 rounded-full flex-row items-center justify-center 
    ${
      completeChoreeMutation.isPending
        ? "bg-emerald-400/50"
        : "bg-emerald-500 dark:bg-emerald-600"
    }
     active:scale-[0.98] transition-all duration-150`}
                            >
                              {completeChoreeMutation.isPending ? (
                                <>
                                  <View className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                  <ThemedText className="text-white text-sm font-medium">
                                    Completing...
                                  </ThemedText>
                                </>
                              ) : (
                                <>
                                  <Ionicons
                                    name="checkmark"
                                    size={16}
                                    color="white"
                                  />
                                  <ThemedText className="text-white text-sm font-medium ml-1">
                                    Mark Done
                                  </ThemedText>
                                </>
                              )}
                            </TouchableOpacity>
                          )}
                        </View>

                        <View>
                          <View className="flex-row items-center">
                            <Ionicons name="time" size={16} color="#f59e0b" />
                            <ThemedText className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                              Due: {chore.timing || "Not set"}
                            </ThemedText>
                          </View>

                          <View className="flex-row items-center mt-2">
                            <Ionicons
                              name="time-outline"
                              size={16}
                              color="#6b7280"
                            />
                            <ThemedText className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                              Last: {formatDate(chore.lastCompleted)}
                            </ThemedText>
                          </View>
                        </View>
                      </Pressable>
                    </View>
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
