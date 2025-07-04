import { useLocalSearchParams, useRouter } from "expo-router";
import { useChoreByIdQuery } from "@/hooks/choreHooks";
import { View, Alert } from "react-native";
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
    // TODO: Navigate to edit chore screen
    Alert.alert("Edit Chore", "Edit functionality will be implemented soon");
  };

  const handleDelete = () => {
    setShowOptionsModal(false);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirmation(false);
    // TODO: Implement delete chore mutation
    Alert.alert("Delete", "Delete functionality will be implemented soon");
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
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={confirmDelete}
          title="Delete Chore"
          message={`Are you sure you want to delete "${chore?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          destructive={true}
          icon="trash-outline"
        />
      </View>
    </LoadingAndErrorHandling>
  );
};

export default ChoreDetailsScreen;
