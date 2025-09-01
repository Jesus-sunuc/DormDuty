import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useJoinRoomByCodeMutation } from "@/hooks/membershipHooks";
import { useAuth } from "@/hooks/user/useAuth";
import { toastError, toastSuccess } from "@/components/ToastService";
import Ionicons from "@expo/vector-icons/Ionicons";

interface JoinRoomModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (roomId: number) => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [roomCode, setRoomCode] = useState("");
  const { user } = useAuth();
  const joinRoomMutation = useJoinRoomByCodeMutation();

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      toastError("Please enter an apartment code");
      return;
    }

    if (roomCode.trim().length !== 6) {
      toastError("Apartment code must be exactly 6 characters");
      return;
    }

    if (!user?.userId) {
      toastError("User not found");
      return;
    }

    joinRoomMutation.mutate(
      {
        userId: user.userId,
        roomCode: roomCode.trim(),
      },
      {
        onSuccess: (data) => {
          toastSuccess(data.message || "Successfully joined apartment!");
          setRoomCode("");
          onClose();
          onSuccess(data.roomId);
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.detail || "Failed to join apartment";
          toastError(errorMessage);
        },
      }
    );
  };

  const handleClose = () => {
    setRoomCode("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white dark:bg-neutral-800 rounded-2xl p-6 w-full max-w-sm">
            <View className="flex-row items-center justify-between mb-6">
              <ThemedText className="text-xl font-bold text-gray-700 dark:text-gray-300">
                Join Apartment
              </ThemedText>
              <TouchableOpacity
                onPress={handleClose}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-700 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <ThemedText className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Apartment Code
              </ThemedText>
              <TextInput
                value={roomCode}
                onChangeText={setRoomCode}
                placeholder="Enter 6-character apartment code"
                placeholderTextColor="#9ca3af"
                className="border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-700"
                autoCapitalize="characters"
                autoCorrect={false}
                autoFocus={true}
                maxLength={6}
              />
              <ThemedText className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {roomCode.length}/6 characters
              </ThemedText>
            </View>

            <View className="flex-row space-x-3 gap-3">
              <TouchableOpacity
                onPress={handleClose}
                className="flex-1 py-3 px-4 rounded-lg bg-gray-100 dark:bg-neutral-700"
                disabled={joinRoomMutation.isPending}
              >
                <Text className="text-center font-semibold text-gray-700 dark:text-gray-300">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleJoinRoom}
                className={`flex-1 py-3 px-4 rounded-lg ${
                  joinRoomMutation.isPending || roomCode.trim().length !== 6
                    ? "bg-gray-100 dark:bg-gray-600"
                    : "bg-blue-100 dark:bg-blue-600 border border-blue-200 dark:border-blue-700"
                }`}
                disabled={
                  joinRoomMutation.isPending || roomCode.trim().length !== 6
                }
              >
                <Text className="text-center font-semibold text-blue-500 dark:text-white">
                  {joinRoomMutation.isPending ? "Joining..." : "Join Apartment"}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mt-4">
              <ThemedText className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Ask an apartment member to share the apartment code with you
              </ThemedText>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
