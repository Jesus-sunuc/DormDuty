import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useUpdateUserRoleMutation } from "@/hooks/membershipHooks";
import { usePermissions } from "@/hooks/usePermissions";
import { Role } from "@/models/Membership";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { toastSuccess, toastError } from "@/components/ToastService";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import Ionicons from "@expo/vector-icons/Ionicons";

interface RoleManagementProps {
  roomId: number;
  targetUserId: number;
  targetUserName: string;
  currentRole: Role;
  onClose: () => void;
}

export const RoleManagement: React.FC<RoleManagementProps> = ({
  roomId,
  targetUserId,
  targetUserName,
  currentRole,
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const { isAdmin, userId } = usePermissions(roomId);
  const { mutate: updateRole, isPending } = useUpdateUserRoleMutation();

  const [selectedRole, setSelectedRole] = useState<Role>(currentRole);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleUpdateRole = () => {
    if (selectedRole === currentRole) {
      onClose();
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmRoleUpdate = () => {
    setShowConfirmModal(false);
    updateRole(
      {
        userId: targetUserId,
        roomId,
        newRole: selectedRole,
        adminUserId: userId,
      },
      {
        onSuccess: () => {
          toastSuccess(`${targetUserName}'s role updated to ${selectedRole}`);
          onClose();
        },
        onError: (error) => {
          toastError("Failed to update role. Please try again.");
        },
      }
    );
  };

  if (!isAdmin) {
    return (
      <View className="p-4">
        <ThemedText className="text-center text-gray-500">
          You don't have permission to manage roles.
        </ThemedText>
      </View>
    );
  }

  return (
    <View className="p-6 bg-white dark:bg-neutral-800 rounded-lg">
      <View className="flex-row items-center justify-between mb-6">
        <ThemedText className="text-xl text-gray-700 dark:text-gray-300 font-bold">
          Manage Role: {targetUserName}
        </ThemedText>
        <TouchableOpacity onPress={onClose}>
          <Ionicons
            name="close"
            size={24}
            color={Colors[colorScheme ?? "light"].text}
          />
        </TouchableOpacity>
      </View>

      <View className="space-y-4">
        <Text className="text-gray-600 dark:text-gray-300 mb-4">
          Current role: {currentRole}
        </Text>

        <View className="space-y-2">
          {Object.values(Role).map((role) => (
            <TouchableOpacity
              key={role}
              onPress={() => setSelectedRole(role)}
              className={`p-4 rounded-lg mb-2 border-2 ${
                selectedRole === role
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="font-semibold text-gray-900 dark:text-white capitalize">
                    {role}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {role === Role.ADMIN
                      ? "Can manage room settings and member roles"
                      : "Can participate in room activities"}
                  </Text>
                </View>
                {selectedRole === role && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Colors[colorScheme ?? "light"].tint}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row space-x-4 mt-6 gap-3">
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 p-4 rounded-lg border border-gray-300 dark:border-gray-600"
          >
            <Text className="text-center font-semibold text-gray-700 dark:text-gray-300">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleUpdateRole}
            disabled={isPending}
            className="flex-1 p-4 rounded-lg bg-blue-600 disabled:bg-gray-400"
          >
            <Text className="text-center font-semibold text-white">
              {isPending ? "Updating..." : "Update Role"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmRoleUpdate}
        title="Update Role"
        message={`Are you sure you want to change ${targetUserName}'s role to ${selectedRole}?`}
        confirmText="Update"
        cancelText="Cancel"
        destructive={true}
        icon="person-circle-outline"
      />
    </View>
  );
};
