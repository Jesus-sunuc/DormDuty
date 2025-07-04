import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { useAddChoreMutation } from "@/hooks/choreHooks";
import { toastError, toastSuccess } from "@/components/ToastService";
import { useAuth } from "@/hooks/user/useAuth";
import { useRoomMembersQuery } from "@/hooks/membershipHooks";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import ParallaxScrollView from "@/components/ParallaxScrollViewY";
import { AddChoreHeader } from "@/components/chores/AddChoreHeader";
import { AddChoreForm } from "@/components/chores/AddChoreForm";

const AddChoreScreen = () => {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: members = [] } = useRoomMembersQuery(roomId);

  const { mutate: addChore, isPending } = useAddChoreMutation();

  const [name, setName] = useState("New Chore");
  const [frequency, setFrequency] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<number | undefined>();
  const [timingInput, setTimingInput] = useState("");
  const [assignedTo, setAssignedTo] = useState<number | undefined>();
  const [startDate, setStartDate] = useState<string | undefined>();
  const [description, setDescription] = useState<string | undefined>();

  const formattedMembers = (
    members as unknown as [number, string, number][]
  ).map(([userId, name, membershipId]) => ({
    userId,
    name,
    membershipId,
  }));

  const handleSubmit = () => {
    if (!name.trim() || !roomId) return;

    addChore(
      {
        roomId: parseInt(roomId),
        name: name.trim(),
        frequency,
        dayOfWeek,
        timing: timingInput ? `${timingInput}:00` : undefined,
        description: description?.trim(),
        startDate,
        assignedTo: assignedTo,
        isActive: true,
      },
      {
        onSuccess: () => {
          toastSuccess("Chore added!");
          router.back();
        },
        onError: () => toastError("Failed to add chore"),
      }
    );
  };

  return (
    <LoadingAndErrorHandling>
      <View className="flex-1 bg-gray-50 dark:bg-black">
        <AddChoreHeader
          roomId={roomId || ""}
          isPending={isPending}
          onBack={() => router.back()}
          onSave={handleSubmit}
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

export default AddChoreScreen;
