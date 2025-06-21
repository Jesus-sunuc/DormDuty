import { useState } from "react";
import { Modal, TextInput, View, TouchableOpacity } from "react-native";
import { useAddRoomMutation } from "@/hooks/roomHooks";
import { ThemedText } from "@/components/ThemedText";
import { toastError, toastSuccess } from "../ToastService";

interface RoomCreateModalProps {
  visible: boolean;
  onClose: () => void;
}

export const RoomCreateModal = ({ visible, onClose }: RoomCreateModalProps) => {
  const [name, setName] = useState("");
  const { mutate, isPending } = useAddRoomMutation();

  const handleSubmit = () => {
    if (!name.trim()) return;

    mutate(
      {
        name,
        createdBy: 2,
      },
      {
        onSuccess: (data) => {
          toastSuccess(`Room "${name}" created successfully!`);
          setName("");
          onClose();
        },
        onError: (err) => {
          toastError("Failed to create room");
        },
      }
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View className="w-full bg-white dark:bg-neutral-900 rounded-xl p-5">
          <ThemedText className="text-lg font-semibold mb-3 dark:text-gray-300">
            Create New Room
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
              <ThemedText className="text-red-500">Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isPending}
              className="px-4 py-2 bg-customGreen-600 rounded-lg"
            >
              <ThemedText className="text-white">Create</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
