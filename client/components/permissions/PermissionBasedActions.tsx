import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { usePermissions } from "@/hooks/usePermissions";
import { Role } from "@/models/Membership";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useColorScheme } from "@/hooks/useColorScheme";

interface PermissionBasedActionsProps {
  roomId: number;
  onAdminAction?: () => void;
  onMemberAction?: () => void;
  adminActionLabel?: string;
  memberActionLabel?: string;
  showRoleInfo?: boolean;
}

export const PermissionBasedActions: React.FC<PermissionBasedActionsProps> = ({
  roomId,
  onAdminAction,
  onMemberAction,
  adminActionLabel = "Admin Action",
  memberActionLabel = "Member Action",
  showRoleInfo = false,
}) => {
  const { isAdmin, role, isMember, isLoading } = usePermissions(roomId);

  if (isLoading) {
    return (
      <View className="p-4">
        <ThemedText className="text-center text-gray-500">
          Loading permissions...
        </ThemedText>
      </View>
    );
  }

  if (!isMember) {
    return (
      <View className="p-4">
        <ThemedText className="text-center text-red-500">
          You are not a member of this room
        </ThemedText>
      </View>
    );
  }

  return (
    <View className="space-y-2">
      {showRoleInfo && (
        <View className="mb-4 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
          <View className="flex-row items-center justify-between">
            <ThemedText className="font-medium">Your Role:</ThemedText>
            <View
              className={`px-3 py-1 rounded-full ${
                isAdmin
                  ? "bg-green-100 dark:bg-green-900"
                  : "bg-blue-100 dark:bg-blue-900"
              }`}
            >
              <Text
                className={`text-xs font-medium capitalize ${
                  isAdmin
                    ? "text-green-800 dark:text-green-200"
                    : "text-blue-800 dark:text-blue-200"
                }`}
              >
                {role}
              </Text>
            </View>
          </View>
        </View>
      )}

      {isAdmin && onAdminAction && (
        <TouchableOpacity
          onPress={onAdminAction}
          className="p-4 bg-green-500 rounded-lg flex-row items-center justify-center space-x-2"
        >
          <Ionicons name="shield-checkmark" size={20} color="white" />
          <Text className="text-white font-semibold">{adminActionLabel}</Text>
        </TouchableOpacity>
      )}

      {isMember && onMemberAction && (
        <TouchableOpacity
          onPress={onMemberAction}
          className="p-4 bg-blue-500 rounded-lg flex-row items-center justify-center space-x-2"
        >
          <Ionicons name="person" size={20} color="white" />
          <Text className="text-white font-semibold">{memberActionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export const usePermissionGuard = (
  roomId: number,
  requiredRole: Role = Role.MEMBER
) => {
  const { isAdmin, role, isMember, isLoading } = usePermissions(roomId);

  const hasPermission = () => {
    if (requiredRole === Role.ADMIN) {
      return isAdmin;
    }
    return isMember;
  };

  const PermissionGuard: React.FC<{
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }> = ({
    children,
    fallback = (
      <ThemedText className="text-center text-gray-500">
        Access denied
      </ThemedText>
    ),
  }) => {
    if (isLoading) {
      return <ThemedText className="text-center">Loading...</ThemedText>;
    }

    return hasPermission() ? <>{children}</> : <>{fallback}</>;
  };

  return {
    hasPermission: hasPermission(),
    isLoading,
    PermissionGuard,
  };
};
