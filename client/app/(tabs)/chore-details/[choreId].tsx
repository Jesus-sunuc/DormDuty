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
import { usePermissions } from "@/hooks/usePermissions";
import { Role } from "@/models/Membership";

const ChoreDetailsScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const choreId = Array.isArray(params.choreId)
    ? params.choreId[0]
    : typeof params.choreId === "string"
      ? params.choreId
      : undefined;
  const roomId = Array.isArray(params.roomId)
    ? params.roomId[0]
    : typeof params.roomId === "string"
      ? params.roomId
      : undefined;

  const choreIdNumber = choreId ? Number(choreId) : 0;

  const {
    data: chore,
    error: choreError,
    isLoading: choreLoading,
  } = useChoreByIdQuery(choreIdNumber);

  const {
    mutate: deleteChore,
    isPending: isDeleting,
    error: deletionError,
  } = useDeleteChoreMutation();

  const effectiveRoomId =
    roomId || (chore?.roomId ? String(chore.roomId) : undefined);
  const { data: members = [], error: membersError } = useRoomMembersQuery(
    effectiveRoomId || ""
  );

  // Get user permissions for this room
  const roomIdNumber = effectiveRoomId ? Number(effectiveRoomId) : 0;
  const { hasPermission, isLoading: permissionsLoading } =
    usePermissions(roomIdNumber);
  const isAdmin = hasPermission(Role.ADMIN);

  if (!choreId) {
    return (
      <LoadingAndErrorHandling>
        <ChoreNotFound onBack={() => router.push("/chores")} />
      </LoadingAndErrorHandling>
    );
  }

  if (isNaN(choreIdNumber) || choreIdNumber <= 0) {
    return (
      <LoadingAndErrorHandling>
        <ChoreNotFound onBack={() => router.push("/chores")} />
      </LoadingAndErrorHandling>
    );
  }

  if (choreLoading) {
    return (
      <LoadingAndErrorHandling
        isLoading={true}
        error={null}
        loadingText="Loading chore details..."
      >
        <></>
      </LoadingAndErrorHandling>
    );
  }

  if (choreError) {
    return (
      <LoadingAndErrorHandling isLoading={false} error={choreError}>
        <></>
      </LoadingAndErrorHandling>
    );
  }

  if (!chore) {
    return (
      <LoadingAndErrorHandling>
        <ChoreNotFound onBack={() => router.push("/chores")} />
      </LoadingAndErrorHandling>
    );
  }

  const memberMap = new Map(
    members.map((member) => [member.membershipId, member.name])
  );

  const handleBack = () => {
    if (roomId) {
      router.push(`/rooms/${roomId}`);
    } else {
      router.push("/chores");
    }
  };

  const handleEdit = () => {
    if (!isAdmin) {
      toastError("Only admins can edit chores");
      return;
    }
    setShowOptionsModal(false);
    if (chore && effectiveRoomId) {
      router.push(`/rooms/${effectiveRoomId}/edit/${choreIdNumber}`);
    }
  };

  const handleDelete = () => {
    if (!isAdmin) {
      toastError("Only admins can delete chores");
      return;
    }
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
      onError: (error: any) => {
        setShowDeleteConfirmation(false);
        toastError("Failed to delete chore. Please try again.");
      },
    });
  };

  const assignedMemberName =
    memberMap.get(chore?.assignedTo ?? -1) || "Unassigned";

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black">
      <ChoreDetailsHeader
        choreName={chore?.name}
        assignedMemberName={assignedMemberName}
        onBack={handleBack}
        onOptions={() => setShowOptionsModal(true)}
        showOptions={isAdmin}
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
  );
};

export default ChoreDetailsScreen;
