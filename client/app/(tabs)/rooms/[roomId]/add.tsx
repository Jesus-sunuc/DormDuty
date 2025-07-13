import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { useAddChoreMutation } from "@/hooks/choreHooks";
import { toastError, toastSuccess } from "@/components/ToastService";
import { ThemedText } from "@/components/ThemedText";
import { useRoomMembersQuery } from "@/hooks/membershipHooks";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import ParallaxScrollView from "@/components/ParallaxScrollViewY";
import { AddChoreHeader } from "@/components/chores/AddChoreHeader";
import { AddChoreForm } from "@/components/chores/AddChoreForm";
import { validateChoreRequest } from "@/utils/choreUtils";
import { usePermissions } from "@/hooks/usePermissions";
import { Role } from "@/models/Membership";

const AddChoreScreen = () => {
  const router = useRouter();

  const params = useLocalSearchParams();
  const roomId = Array.isArray(params.roomId)
    ? params.roomId[0]
    : typeof params.roomId === "string"
      ? params.roomId
      : undefined;

  const roomMembersQuery = useRoomMembersQuery(roomId || "");
  const addChoreMutation = useAddChoreMutation();

  const members = roomMembersQuery.data || [];
  const addChore = addChoreMutation.mutate;
  const isPending = addChoreMutation.isPending;

  const roomIdNumber = roomId ? Number(roomId) : 0;
  const { hasPermission, isLoading: permissionsLoading } =
    usePermissions(roomIdNumber);
  const isAdmin = hasPermission(Role.ADMIN);

  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<number | undefined>();
  const [timingInput, setTimingInput] = useState("");
  const [assignedTo, setAssignedTo] = useState<number[] | undefined>();
  const [startDate, setStartDate] = useState<string | undefined>();
  const [description, setDescription] = useState<string | undefined>();

  if (!roomId) {
    return (
      <LoadingAndErrorHandling>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <ThemedText>Room ID not available</ThemedText>
        </View>
      </LoadingAndErrorHandling>
    );
  }

  if (permissionsLoading) {
    return (
      <LoadingAndErrorHandling
        isLoading={true}
        loadingText="Checking permissions..."
      >
        <></>
      </LoadingAndErrorHandling>
    );
  }

  if (!isAdmin) {
    return (
      <LoadingAndErrorHandling>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <ThemedText>Only room admins can create chores</ThemedText>
        </View>
      </LoadingAndErrorHandling>
    );
  }

  const formattedMembers = Array.isArray(members)
    ? members.map((member) => ({
        userId: member.userId,
        name: member.name,
        membershipId: member.membershipId,
        role: member.role,
      }))
    : [];

  const handleSubmit = () => {
    if (!isAdmin) {
      toastError("Only admins can create chores");
      return;
    }

    if (!name.trim() || !roomId) return;

    const choreRequest = {
      roomId: parseInt(roomId),
      name: name.trim(),
      frequency,
      dayOfWeek,
      timing: timingInput ? `${timingInput}:00` : undefined,
      description: description?.trim(),
      startDate,
      assignedMemberIds:
        assignedTo && assignedTo.length > 0 ? assignedTo : undefined,
      isActive: true,
    };

    const validationErrors = validateChoreRequest(choreRequest);
    if (validationErrors.length > 0) {
      toastError(validationErrors[0]);
      return;
    }

    addChore(choreRequest, {
      onSuccess: () => {
        toastSuccess("Chore added!");
        router.back();
      },
      onError: () => toastError("Failed to add chore"),
    });
  };

  return (
    <LoadingAndErrorHandling>
      <View className="flex-1 bg-gradient-to-b from-blue-50 to-white dark:from-neutral-900 dark:to-neutral-800">
        <AddChoreHeader
          roomId={roomId || ""}
          isPending={isPending}
          onBack={() => router.back()}
        />

        <AddChoreForm
          name={name}
          setName={setName}
          assignedTo={assignedTo}
          setAssignedTo={setAssignedTo}
          frequency={frequency}
          setFrequency={setFrequency}
          startDate={startDate}
          setStartDate={(date: string) => setStartDate(date)}
          dayOfWeek={dayOfWeek}
          setDayOfWeek={setDayOfWeek}
          timingInput={timingInput}
          setTimingInput={setTimingInput}
          description={description}
          setDescription={setDescription}
          members={formattedMembers}
          onSave={handleSubmit}
          isPending={isPending}
        />
      </View>
    </LoadingAndErrorHandling>
  );
};

export default AddChoreScreen;
