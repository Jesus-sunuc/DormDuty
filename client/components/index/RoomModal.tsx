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
    if (visible) setName(defaultRoomName);
  }, [visible, defaultRoomName]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit(name.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View className="w-full bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-neutral-800">
          <View className="mb-6">
            <ThemedText className="text-xl font-bold text-gray-900 dark:text-white text-center">
              {submitLabel} Room
            </ThemedText>
            <ThemedText className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
              {submitLabel === "Create"
                ? "Create a new apartment space"
                : "Update apartment details"}
            </ThemedText>
          </View>

          <View className="mb-6">
            <ThemedText className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Room Name
            </ThemedText>
            <TextInput
              placeholder="Enter room name"
              placeholderTextColor="#9ca3af"
              className="bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl px-4 py-4 text-lg text-black dark:text-white "
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>

          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-gray-100 dark:bg-neutral-800 rounded-2xl py-4 border border-gray-200 dark:border-neutral-700"
            >
              <ThemedText className="text-center text-gray-600 dark:text-gray-400 font-medium">
                Cancel
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isPending || !name.trim()}
              className={`flex-1 rounded-2xl py-4 shadow-md ${
                isPending || !name.trim()
                  ? "bg-gray-300 dark:bg-neutral-700"
                  : "bg-green-500"
              }`}
            >
              <ThemedText
                className={`text-center font-medium ${
                  isPending || !name.trim() ? "text-gray-500" : "text-white"
                }`}
              >
                {isPending ? "Saving..." : submitLabel}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
