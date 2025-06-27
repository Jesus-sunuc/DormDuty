// app/chores/[roomId]/add.tsx
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAddChoreMutation } from "@/hooks/choreHooks";
import { toastError, toastSuccess } from "@/components/ToastService";

const frequencyOptions = ["once", "daily", "weekly", "custom"];
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const AddChoreScreen = () => {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();

  const { mutate: addChore, isPending } = useAddChoreMutation();

  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("once");
  const [frequencyValue, setFrequencyValue] = useState<number | undefined>();
  const [dayOfWeek, setDayOfWeek] = useState<number | undefined>();
  const [timingInput, setTimingInput] = useState("");


  const handleSubmit = () => {
    if (!name.trim() || !roomId) return;

    addChore(
      {
        roomId: parseInt(roomId),
        name: name.trim(),
        frequency,
        frequencyValue,
        dayOfWeek,
        timing: timingInput ? `${timingInput}:00` : undefined,

        isActive: true,
      },
      {
        onSuccess: () => {
          toastSuccess("Chore added!");
          router.back(); // Go back to room page
        },
        onError: () => toastError("Failed to add chore"),
      }
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text className="text-xl font-bold mb-4">Add Chore</Text>

      <TextInput
        placeholder="Chore name"
        value={name}
        onChangeText={setName}
        className="border p-2 rounded-lg mb-4 text-black dark:text-white"
      />

      <Text className="mb-1">Frequency</Text>
      {frequencyOptions.map((option) => (
        <TouchableOpacity
          key={option}
          className={`p-2 rounded-lg mb-2 ${frequency === option ? "bg-customGreen-500" : "bg-neutral-800"}`}
          onPress={() => setFrequency(option)}
        >
          <Text className="text-white">{option}</Text>
        </TouchableOpacity>
      ))}

      <TextInput
        placeholder="Frequency Value (e.g., every 2 days)"
        keyboardType="numeric"
        value={frequencyValue?.toString() ?? ""}
        onChangeText={(text) =>
          setFrequencyValue(text ? parseInt(text) : undefined)
        }
        className="border p-2 rounded-lg mb-4 text-black dark:text-white"
      />

      <Text className="mb-1">Day of Week</Text>
      {daysOfWeek.map((day, index) => (
        <TouchableOpacity
          key={day}
          className={`p-2 rounded-lg mb-2 ${dayOfWeek === index ? "bg-customGreen-500" : "bg-neutral-800"}`}
          onPress={() => setDayOfWeek(index)}
        >
          <Text className="text-white">{day}</Text>
        </TouchableOpacity>
      ))}

      <Text className="mb-1">Time</Text>
      <TextInput
        placeholder="Timing (HH:MM)"
        value={timingInput}
        onChangeText={(text) => setTimingInput(text)}
        className="border p-2 rounded-lg mb-4 text-black dark:text-white"
      />

      <View className="flex-row justify-between mt-6">
        <TouchableOpacity onPress={() => router.back()} className="p-3">
          <Text className="text-gray-400">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={isPending}
          onPress={handleSubmit}
          className="bg-customGreen-500 px-4 py-2 rounded-xl"
        >
          <Text className="text-white font-semibold">Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AddChoreScreen;
