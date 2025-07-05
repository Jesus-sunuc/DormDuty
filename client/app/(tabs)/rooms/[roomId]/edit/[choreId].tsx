import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View, TouchableOpacity, Text } from "react-native";
import { useUpdateChoreMutation, useChoreByIdQuery } from "@/hooks/choreHooks";
import { toastError, toastSuccess } from "@/components/ToastService";
import { ThemedText } from "@/components/ThemedText";
import { useRoomMembersQuery } from "@/hooks/membershipHooks";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import ParallaxScrollView from "@/components/ParallaxScrollViewY";
import { AddChoreHeader } from "@/components/chores/AddChoreHeader";
import { AddChoreForm } from "@/components/chores/AddChoreForm";
import { validateChoreRequest } from "@/utils/choreUtils";
import { toISODateString, toTimeString } from "@/utils/dateUtils";

const getSafeParams = () => {
  const params = useLocalSearchParams();
  if (!params || typeof params !== "object") {
    return { roomId: undefined, choreId: undefined };
  }

  const roomId = Array.isArray(params.roomId)
    ? params.roomId[0]
    : typeof params.roomId === "string"
      ? params.roomId
      : undefined;

  const choreId = Array.isArray(params.choreId)
    ? params.choreId[0]
    : typeof params.choreId === "string"
      ? params.choreId
      : undefined;

  return { roomId, choreId };
};

const EditChoreScreen = () => {
  const router = useRouter();
  const { roomId, choreId } = getSafeParams();

  if (!roomId || !choreId) {
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
          <Text>Missing required parameters</Text>
        </View>
      </LoadingAndErrorHandling>
    );
  }

  const choreIdNumber = Number(choreId);

  if (isNaN(choreIdNumber) || choreIdNumber <= 0) {
    return (
      <LoadingAndErrorHandling>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <Text>Invalid chore ID</Text>
        </View>
      </LoadingAndErrorHandling>
    );
  }

  const membersResult = useRoomMembersQuery(roomId);
  const members = membersResult.data || [];
  const membersError = membersResult.error;
  const membersLoading = membersResult.isLoading;

  const choreResult = useChoreByIdQuery(choreIdNumber);
  const chore = choreResult.data;
  const choreError = choreResult.error;
  const choreLoading = choreResult.isLoading;

  const mutationResult = useUpdateChoreMutation();
  const updateChore = mutationResult.mutate;
  const isPending = mutationResult.isPending;
  const mutationError = mutationResult.error;

  const isLoading = membersLoading || choreLoading;
  const error = membersError || choreError;

  const nameState = useState("");
  const name = nameState[0];
  const setName = nameState[1];

  const frequencyState = useState("");
  const frequency = frequencyState[0];
  const setFrequency = frequencyState[1];

  const dayOfWeekState = useState<number | undefined>();
  const dayOfWeek = dayOfWeekState[0];
  const setDayOfWeek = dayOfWeekState[1];

  const timingInputState = useState("");
  const timingInput = timingInputState[0];
  const setTimingInput = timingInputState[1];

  const assignedToState = useState<number | undefined>();
  const assignedTo = assignedToState[0];
  const setAssignedTo = assignedToState[1];

  const startDateState = useState<string | undefined>();
  const startDate = startDateState[0];
  const setStartDate = startDateState[1];

  const descriptionState = useState<string | undefined>();
  const description = descriptionState[0];
  const setDescription = descriptionState[1];

  useEffect(() => {
    if (chore) {
      setName(chore.name || "");
      setFrequency(chore.frequency || "");
      setDayOfWeek(chore.dayOfWeek);
      setTimingInput(toTimeString(chore.timing));
      setAssignedTo(chore.assignedTo);
      setStartDate(toISODateString(chore.startDate as any));
      setDescription(chore.description);
    }
  }, [chore]);

  const formattedMembers = (
    members as unknown as [number, string, number][]
  ).map((member) => {
    const userId = member[0];
    const name = member[1];
    const membershipId = member[2];
    return {
      userId,
      name,
      membershipId,
    };
  });

  const handleSubmit = () => {
    if (!name.trim() || !roomId || !choreId) return;

    const updateRequest = {
      roomId: parseInt(roomId),
      name: name.trim(),
      frequency,
      dayOfWeek,
      timing: timingInput ? `${timingInput}:00` : undefined,
      description: description?.trim(),
      startDate,
      assignedTo: assignedTo,
      isActive: chore?.isActive ?? true,
    };

    const validationErrors = validateChoreRequest(updateRequest);
    if (validationErrors.length > 0) {
      toastError(validationErrors[0]);
      return;
    }

    updateChore(
      {
        choreId: choreIdNumber,
        chore: updateRequest,
      },
      {
        onSuccess: () => {
          toastSuccess("Chore updated successfully!");
          router.back();
        },
        onError: (error: any) => {
          toastError("Failed to update chore. Please try again.");
        },
      }
    );
  };

  if (!chore) {
    return (
      <LoadingAndErrorHandling>
        <View className="flex-1 bg-gray-50 dark:bg-black">
          <View className="bg-white dark:bg-neutral-900 px-6 pt-12 pb-6 shadow-lg">
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center"
              >
                <Text className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                  ✕
                </Text>
              </TouchableOpacity>
              <View className="flex-1 mx-4">
                <ThemedText className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Chore not found
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </LoadingAndErrorHandling>
    );
  }

  if (isLoading || !chore) {
    return (
      <LoadingAndErrorHandling
        isLoading={true}
        error={null}
        loadingText="Loading chore data..."
      >
        <></>
      </LoadingAndErrorHandling>
    );
  }

  return (
    <LoadingAndErrorHandling isLoading={false} error={error}>
      <View className="flex-1 bg-gray-50 dark:bg-black">
        <AddChoreHeader
          roomId={roomId || ""}
          isPending={isPending}
          onBack={() => router.back()}
          onSave={handleSubmit}
          isEdit={true}
          choreName={chore.name}
        />

        <ParallaxScrollView>
          <View className="px-6 pt-6">
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
            />
          </View>
        </ParallaxScrollView>
      </View>
    </LoadingAndErrorHandling>
  );
};

export default EditChoreScreen;
