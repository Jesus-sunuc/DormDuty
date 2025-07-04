import { useLocalSearchParams, useRouter } from "expo-router";
import { useChoreByIdQuery, useDeleteChoreMutation } from "@/hooks/choreHooks";
import { View } from "react-native";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import { useRoomMembersQuery } from "@/hooks/membershipHooks";
import ParallaxScrollView from "@/components/ParallaxScrollViewY";
import { useState } from "react";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { ChoreDetailsHeader } from "@/components/chores/ChoreDetailsHeader";
import { ChoreInfoCard } from "@/components/chores/ChoreInfoCard";
import { ChoreDescriptionCard } from "@/components/chores/ChoreDescriptionCard";
import { ChoreOptionsModal } from "@/components/chores/ChoreOptionsModal";
import { ChoreNotFound } from "@/components/chores/ChoreNotFound";
import { toastError, toastSuccess } from "@/components/ToastService";

const ChoreDetailsScreen = () => {
  const { choreId, roomId } = useLocalSearchParams<{
    choreId: string;
    roomId?: string;
  }>();
  const router = useRouter();
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const choreIdNumber = choreId ? Number(choreId) : 0;
  const { data: chore } = useChoreByIdQuery(choreIdNumber);
  const { mutate: deleteChore, isPending: isDeleting } = useDeleteChoreMutation();

  const effectiveRoomId =
    roomId || (chore?.roomId ? String(chore.roomId) : undefined);
  const { data: members = [] } = useRoomMembersQuery(effectiveRoomId || "");

  const memberMap = new Map(
    (members as unknown as [number, string, number][]).map(([userId, name]) => [
      userId,
      name,
    ])
  );

  const handleBack = () => {
    if (roomId) {
      router.push(`/rooms/${roomId}`);
    } else {
      router.push('/chores');
    }
  };

  const handleEdit = () => {
    setShowOptionsModal(false);
    if (chore && effectiveRoomId) {
      router.push(`/rooms/${effectiveRoomId}/edit/${choreIdNumber}`);
    }
  };

  const handleDelete = () => {
    setShowOptionsModal(false);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (!chore) return;
    
    deleteChore(choreIdNumber, {
      onSuccess: () => {
        setShowDeleteConfirmation(false);
        toastSuccess("Chore deleted successfully!");
        handleBack();
      },
      onError: (error) => {
        setShowDeleteConfirmation(false);
        console.error("Error deleting chore:", error);
        toastError("Failed to delete chore. Please try again.");
      }
    });
  };

  if (!chore) {
    return (
      <LoadingAndErrorHandling>
        <ChoreNotFound onBack={handleBack} />
      </LoadingAndErrorHandling>
    );
  }

  const assignedMemberName = memberMap.get(chore?.assignedTo ?? -1) || "Unassigned";

  return (
    <LoadingAndErrorHandling>
      <View className="flex-1 bg-gray-50 dark:bg-black">
        <ChoreDetailsHeader
          choreName={chore?.name}
          assignedMemberName={assignedMemberName}
          onBack={handleBack}
          onOptions={() => setShowOptionsModal(true)}
        />

        <ParallaxScrollView>
          <View className="px-6 pt-6">
            <ChoreInfoCard
              frequency={chore?.frequency}
              startDate={chore?.startDate}
              dayOfWeek={chore?.dayOfWeek}
              timing={chore?.timing}
            />

            {chore?.description && (
              <ChoreDescriptionCard description={chore.description} />
            )}
          </View>
        </ParallaxScrollView>

        <ChoreOptionsModal
          visible={showOptionsModal}
          onClose={() => setShowOptionsModal(false)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <ConfirmationModal
          visible={showDeleteConfirmation}
          onClose={() => !isDeleting && setShowDeleteConfirmation(false)}
          onConfirm={confirmDelete}
          title="Delete Chore"
          message={`Are you sure you want to delete "${chore?.name}"? This action cannot be undone.`}
          confirmText={isDeleting ? "Deleting..." : "Delete"}
          cancelText="Cancel"
          destructive={true}
          icon="trash-outline"
        />
      </View>
    </LoadingAndErrorHandling>
  );
};

export default ChoreDetailsScreen;
