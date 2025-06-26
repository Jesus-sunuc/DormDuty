import { Modal, View, TextInput, TouchableOpacity, Text } from "react-native";
import { useState } from "react";
import { ThemedText } from "@/components/ThemedText";

export const ChoreModal = ({
  visible,
  onClose,
  onSubmit,
  isPending,
  defaultName = "",
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  isPending?: boolean;
  defaultName?: string;
}) => {
  const [name, setName] = useState(defaultName);

  const handleSave = () => {
    if (name.trim()) onSubmit(name.trim());
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-center items-center bg-black/70 px-6">
        <View className="bg-white dark:bg-neutral-900 p-6 rounded-xl w-full">
          <ThemedText className="text-lg font-semibold mb-3 dark:text-gray-300">Add Chore</ThemedText>
          <TextInput
            placeholder="Chore name"
            placeholderTextColor="#9ca3af"
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-black dark:text-white"
            value={name}
            onChangeText={setName}
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
