import {
  useChoresAssignedToUserQuery,
  useChoresAssignedWithStatusQuery,
  useCompleteChoreMutation,
  usePendingCompletionsByRoomQuery,
} from "@/hooks/choreHooks";
import { useMembershipQuery } from "@/hooks/membershipHooks";
import { View, Alert } from "react-native";
import { formatDistance } from "date-fns";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import ParallaxScrollViewY from "@/components/ParallaxScrollViewY";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/user/useAuth";
import { Header } from "@/components/ui/Header";
import { useSidebar } from "@/hooks/useSidebar";
import { useState } from "react";
import { ChoreVerificationModalWrapper } from "@/components/chores/ChoreVerificationModalWrapper";
import { Chore } from "@/models/Chore";
import { ChoreCompletionModal } from "@/components/chores/ChoreCompletionModal";
import { usePermissions } from "@/hooks/usePermissions";
import { Role } from "@/models/Membership";
import { SwipeableChoreCard } from "@/components/chores/SwipeableChoreCard";

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

  const chores = choreData?.chores ?? assignedChores;
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
      <View className="flex-1 bg-gray-100 dark:bg-black">
        <Header title="My Chores" onMenuPress={openSidebar} />

        <ParallaxScrollViewY>
          {chores.length === 0 ? (
            <View className="flex-1 items-center justify-center px-6 py-20">
              <Ionicons
                name="checkmark-circle-outline"
                size={64}
                color="#6b7280"
              />
              <ThemedText className="text-center text-gray-600 dark:text-gray-400 mt-4 text-lg font-medium">
                No chores assigned yet
              </ThemedText>
              <ThemedText className="text-center text-gray-700 dark:text-gray-500 mt-2 text-sm">
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
                  <SwipeableChoreCard
                    key={chore.choreId}
                    chore={chore}
                    isPendingCompletion={isPendingCompletion}
                    isMarkingDone={completeChoreeMutation.isPending}
                    onPress={() =>
                      router.push(`/chore-details/${chore.choreId}`)
                    }
                    onMarkDone={() => handleCompleteChore(chore)}
                    formatDate={formatDate}
                  />
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
