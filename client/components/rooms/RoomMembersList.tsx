import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { useRoomMembersQuery } from "@/hooks/membershipHooks";
import { usePermissions } from "@/hooks/usePermissions";
import { Role } from "@/models/Membership";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { RoleManagement } from "./RoleManagement";
import Ionicons from "@expo/vector-icons/Ionicons";

interface RoomMembersListProps {
  roomId: string | undefined;
}

export const RoomMembersList: React.FC<RoomMembersListProps> = ({ roomId }) => {
  if (
    !roomId ||
    typeof roomId !== "string" ||
    roomId === "undefined" ||
    roomId === "" ||
    roomId === "0"
  ) {
    return (
      <View className="p-4">
        <ThemedText className="text-center text-gray-500">
          Room ID not available
        </ThemedText>
      </View>
    );
  }

  return <RoomMembersListContent roomId={roomId} />;
};

const RoomMembersListContent: React.FC<{ roomId: string }> = ({ roomId }) => {
  const colorScheme = useColorScheme();
  const roomIdNum = parseInt(roomId, 10);
  const { isAdmin } = usePermissions(isNaN(roomIdNum) ? 0 : roomIdNum);
  const { data: members = [], isLoading, error } = useRoomMembersQuery(roomId);

  const [selectedMember, setSelectedMember] = useState<{
    userId: number;
    name: string;
    role: Role;
  } | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleManageRole = (member: any) => {
    setSelectedMember({
      userId: member?.userId || 0,
      name: member?.name || "Unknown User",
      role:
        (member?.role === "admin" ? Role.ADMIN : Role.MEMBER) || Role.MEMBER,
    });
    setShowRoleModal(true);
  };

  const closeRoleModal = () => {
    setShowRoleModal(false);
    setSelectedMember(null);
  };

  if (isLoading) {
    return (
      <View className="p-4">
        <ThemedText className="text-center">Loading members...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View className="p-4">
        <ThemedText className="text-center text-red-500">
          Error loading members
        </ThemedText>
      </View>
    );
  }

  const renderMember = ({ item }: { item: any }) => (
    <View className="flex-row items-center justify-between p-4 bg-white dark:bg-neutral-800 rounded-lg mb-2">
      <View className="flex-1">
        <Text className="font-semibold text-gray-900 dark:text-white">
          {item?.name || "Unknown User"}
        </Text>
      </View>

      <View className="flex-row items-center space-x-2">
        <View
          className={`px-3 py-1 rounded-full me-1 ${
            item?.role === "admin"
              ? "bg-green-100 dark:bg-green-900"
              : "bg-blue-100 dark:bg-blue-900"
          }`}
        >
          <Text
            className={`text-xs font-medium capitalize ${
              item?.role === "admin"
                ? "text-green-800 dark:text-green-200"
                : "text-blue-800 dark:text-blue-200"
            }`}
          >
            {item?.role || "member"}
          </Text>
        </View>

        {isAdmin && (
          <TouchableOpacity
            onPress={() => handleManageRole(item)}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700"
          >
            <Ionicons
              name="settings"
              size={16}
              color={Colors[colorScheme ?? "light"].text}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between mb-4">
        <ThemedText className="text-xl font-bold">
          Room Members ({members.length})
        </ThemedText>
        {isAdmin && (
          <View className="px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full">
            <Text className="text-xs font-medium text-green-800 dark:text-green-200">
              Admin
            </Text>
          </View>
        )}
      </View>

      <View style={{ paddingBottom: 20 }}>
        {members.map((item) => (
          <View
            key={
              item.membershipId?.toString() ||
              `member-${item.userId || Math.random()}`
            }
          >
            {renderMember({ item })}
          </View>
        ))}
      </View>

      {/* Role Management Modal */}
      <Modal
        visible={showRoleModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeRoleModal}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-11/12 max-w-md">
            {selectedMember && (
              <RoleManagement
                roomId={roomIdNum}
                targetUserId={selectedMember.userId}
                targetUserName={selectedMember.name}
                currentRole={selectedMember.role}
                onClose={closeRoleModal}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};
