import { Modal, View, TextInput, TouchableOpacity, Text } from "react-native";
import { useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import { ChoreCreateRequest } from "@/models/Chore";

export const ChoreModal = ({
  visible,
  onClose,
  onSubmit,
  isPending,
  defaultName = "",
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (chore: Partial<ChoreCreateRequest>) => void;
  isPending?: boolean;
  defaultName?: string;
}) => {
  const [name, setName] = useState(defaultName);
  const [frequency, setFrequency] = useState("once");
  const [frequencyValue, setFrequencyValue] = useState<number | undefined>();
  const [dayOfWeek, setDayOfWeek] = useState<number | undefined>();
  const [timing, setTiming] = useState<string>(""); 

  const handleSave = () => {
    if (name.trim()) {
      onSubmit({
        name: name.trim(),
        frequency,
        frequencyValue,
        dayOfWeek,
        timing: timing ? `${timing}:00` : undefined, // append seconds if needed
      });
    }
    setName("");
    setFrequency("once");
    setFrequencyValue(undefined);
    setDayOfWeek(undefined);
    setTiming("");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-center items-center bg-black/70 px-6">
        <View className="bg-white dark:bg-neutral-900 p-6 rounded-xl w-full">
          <ThemedText className="text-lg font-semibold mb-3 dark:text-gray-300">
            Add Chore
          </ThemedText>
          <TextInput
            placeholder="Chore name"
            placeholderTextColor="#9ca3af"
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-black dark:text-white"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            placeholder="Frequency (e.g., daily, weekly)"
            placeholderTextColor="#9ca3af"
            value={frequency}
            onChangeText={setFrequency}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-black dark:text-white mt-2"
          />

          <TextInput
            placeholder="Frequency Value (e.g., every 2 days)"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={frequencyValue?.toString() ?? ""}
            onChangeText={(text) =>
              setFrequencyValue(text ? parseInt(text) : undefined)
            }
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-black dark:text-white mt-2"
          />

          <TextInput
            placeholder="Day of Week (0=Sun, 6=Sat)"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={dayOfWeek?.toString() ?? ""}
            onChangeText={(text) =>
              setDayOfWeek(text ? parseInt(text) : undefined)
            }
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-black dark:text-white mt-2"
          />

          <TextInput
            placeholder="Timing (HH:MM)"
            placeholderTextColor="#9ca3af"
            value={timing}
            onChangeText={setTiming}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-black dark:text-white mt-2"
          />

          <View className="flex-row justify-end mt-4 space-x-2">
            <TouchableOpacity onPress={onClose} className="px-4 py-2">
              <Text className="text-gray-500">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={isPending}
              className="bg-customGreen-500 px-4 py-2 rounded-xl"
            >
              <Text className="text-white font-semibold">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
