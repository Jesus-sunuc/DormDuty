import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { useAddChoreMutation } from "@/hooks/choreHooks";
import { toastError, toastSuccess } from "@/components/ToastService";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Picker } from "@react-native-picker/picker";

const frequencyOptions = ["One Time", "As Needed", "Weekly", "Monthly"];
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
  const [frequency, setFrequency] = useState("One Time");
  const [frequencyValue, setFrequencyValue] = useState<number | undefined>();
  const [dayOfWeek, setDayOfWeek] = useState<number | undefined>();
  const [timingInput, setTimingInput] = useState("");

  const timeOptions = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2)
      .toString()
      .padStart(2, "0");
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour}:${minute}`;
  });

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
        description: undefined,
        startDate: undefined,
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
    <ParallaxScrollView>
      <View className="flex-row justify-between">
        <TouchableOpacity onPress={() => router.back()} className="py-2">
          <Text className="text-gray-600 dark:text-gray-400 text-base">
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={isPending}
          onPress={handleSubmit}
          className="bg-customGreen-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-gray-100">Save</Text>
        </TouchableOpacity>
      </View>
      <ThemedText className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-0">
        Create Chore
      </ThemedText>
      <TextInput
        placeholder="Chore name"
        placeholderTextColor="#9ca3af"
        value={name}
        onChangeText={setName}
        className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-black dark:text-white"
      />

      <ThemedText className="mb-1 mt-4">Repetition</ThemedText>
      <View className="border border-gray-300 dark:border-gray-600 rounded-lg mb-4 overflow-hidden">
        <Picker
          selectedValue={frequency}
          onValueChange={(itemValue) => setFrequency(itemValue)}
          style={{ color: "black" }}
          dropdownIconColor="black"
        >
          {frequencyOptions.map((option) => (
            <Picker.Item key={option} label={option} value={option} />
          ))}
        </Picker>
      </View>

      <TextInput
        placeholder="Frequency Value (e.g., every 2 days)"
        keyboardType="numeric"
        value={frequencyValue?.toString() ?? ""}
        onChangeText={(text) =>
          setFrequencyValue(text ? parseInt(text) : undefined)
        }
        className="border p-2 rounded-lg mb-4 text-black dark:text-white"
      />

      <ThemedText className="mb-1">Day of Week</ThemedText>
      <View className="border border-gray-300 dark:border-gray-600 rounded-lg mb-4 overflow-hidden">
        <Picker
          selectedValue={dayOfWeek}
          onValueChange={(itemValue) => setDayOfWeek(itemValue)}
          style={{ color: "black" }}
          dropdownIconColor="black"
        >
          {daysOfWeek.map((day, index) => (
            <Picker.Item key={day} label={day} value={index} />
          ))}
        </Picker>
      </View>

      <ThemedText className="mb-1">Time</ThemedText>
      <View className="border border-gray-300 dark:border-gray-600 rounded-lg mb-4 overflow-hidden">
        <Picker
          selectedValue={timingInput}
          onValueChange={(value) => setTimingInput(value)}
          style={{ color: "black" }}
          dropdownIconColor="black"
        >
          <Picker.Item label="Select time" value={undefined} />
          {timeOptions.map((time) => (
            <Picker.Item key={time} label={time} value={time} />
          ))}
        </Picker>
      </View>
    </ParallaxScrollView>
  );
};

export default AddChoreScreen;
