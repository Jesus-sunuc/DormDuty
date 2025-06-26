import { useState, useEffect } from "react";
import { Modal, TextInput, View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";

interface RoomModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  defaultName?: string;
  submitLabel?: string;
  isPending?: boolean;
}

export const RoomModal = ({
  visible,
  onClose,
  onSubmit,
  defaultName: defaultRoomName = "",
  submitLabel = "Save",
  isPending = false,
}: RoomModalProps) => {
  const [name, setName] = useState(defaultRoomName);

  useEffect(() => {
    if (visible) setName(defaultRoomName); // Reset when reopened
  }, [visible, defaultRoomName]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit(name.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-center items-center bg-black/70 px-6">
        <View className="w-full bg-white dark:bg-neutral-900 rounded-xl p-5">
          <ThemedText className="text-lg font-semibold mb-3 dark:text-gray-300">
            {submitLabel} Room
          </ThemedText>

          <TextInput
            placeholder="Room name"
            placeholderTextColor="#9ca3af"
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-black dark:text-white"
            value={name}
            onChangeText={setName}
          />

          <View className="flex-row justify-end mt-4 space-x-2">
            <TouchableOpacity onPress={onClose} className="px-4 py-2">
              <ThemedText className="text-gray-500">Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isPending}
              className="px-4 py-2 bg-customGreen-600 rounded-xl"
            >
              <ThemedText className="text-white">{submitLabel}</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
