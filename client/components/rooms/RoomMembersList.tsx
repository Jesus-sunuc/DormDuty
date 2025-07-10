import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import {
  useRoomMembersQuery,
  useRemoveUserMutation,
 useMembershipQuery } from "@/hooks/membershipHooks";
import { usePermissions } from "@/hooks/usePermissions";
import { Role } from "@/models/Membership";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { RoleManagement } from "./RoleManagement";
import { toastSuccess, toastError } from "@/components/ToastService";
import { useAuth } from "@/hooks/user/useAuth";
import Ionicons from "@expo/vector-icons/Ionicons";

interface RoomMembersListProps {
  roomId: string | undefined;
  onExpandChange?: (expanded: boolean) => void;
  forceExpanded?: boolean;
}

export const RoomMembersList: React.FC<RoomMembersListProps> = ({
  roomId,
  onExpandChange,
  forceExpanded = false,
}) => {
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

  return (
    <RoomMembersListContent
      roomId={roomId}
      onExpandChange={onExpandChange}
      forceExpanded={forceExpanded}
    />
  );
};

const RoomMembersListContent: React.FC<{
  roomId: string;
  onExpandChange?: (expanded: boolean) => void;
  forceExpanded?: boolean;
}> = ({ roomId, onExpandChange, forceExpanded = false }) => {
  const colorScheme = useColorScheme();
  const roomIdNum = parseInt(roomId, 10);
  const { user } = useAuth();
  const userId = user?.userId;
  const { isAdmin } = usePermissions(isNaN(roomIdNum) ? 0 : roomIdNum);
  const { data: members = [], isLoading, error } = useRoomMembersQuery(roomId);
  const { data: currentUserMembership } = useMembershipQuery(
    userId || 0,
    roomIdNum
  );
  const { mutate: removeUser } = useRemoveUserMutation();

  const [selectedMember, setSelectedMember] = useState<{
    userId: number;
    name: string;
    role: Role;
  } | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(forceExpanded);

  const handleExpandToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpandChange?.(newExpanded);
  };

  useEffect(() => {
    setIsExpanded(forceExpanded);
  }, [forceExpanded]);

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

  const handleRemoveUser = (member: any) => {
    if (!currentUserMembership?.membershipId || !member?.membershipId) {
      toastError("Unable to remove user: Missing membership information");
      return;
    }

    Alert.alert(
      "Remove User",
      `Are you sure you want to remove "${member.name}" from this room? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            removeUser(
              {
                adminMembershipId: currentUserMembership.membershipId,
                targetMembershipId: member.membershipId,
                roomId: roomIdNum,
              },
              {
                onSuccess: (data) => {
                  if (data.success) {
                    toastSuccess(data.message);
                    if (data.roomDeleted) {
                    }
                  } else {
                    toastError(data.message);
                  }
                },
                onError: () => {
                  toastError("Failed to remove user");
                },
              }
            );
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-neutral-800">
        <ThemedText className="text-center text-gray-500">
          Loading members...
        </ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-neutral-800">
        <ThemedText className="text-center text-red-500">
          Error loading members
        </ThemedText>
      </View>
    );
  }

  const renderMemberPreview = (member: any, index: number) => {
    const isAdmin = member?.role === "admin";
    return (
      <View
        key={`preview-${member.membershipId || index}`}
        className={`flex-row items-center ${index > 0 ? "ml-2" : ""}`}
      >
        <View
          className={`w-8 h-8 rounded-full items-center justify-center ${
            isAdmin
              ? "bg-green-100 dark:bg-green-900"
              : "bg-blue-100 dark:bg-blue-900"
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              isAdmin
                ? "text-green-800 dark:text-green-200"
                : "text-blue-800 dark:text-blue-200"
            }`}
          >
            {member?.name?.charAt(0)?.toUpperCase() || "?"}
          </Text>
        </View>
        {isAdmin && (
          <View className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900" />
        )}
      </View>
    );
  };

  const renderMember = ({ item }: { item: any }) => (
    <View className="flex-row items-center justify-between p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg mb-2">
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
          <View className="flex-row items-center space-x-1">
            {item?.userId !== userId && (
              <TouchableOpacity
                onPress={() => handleRemoveUser(item)}
                className="p-2 rounded-full bg-red-100 dark:bg-red-900 mr-1"
              >
                <Ionicons name="person-remove" size={16} color="#ef4444" />
              </TouchableOpacity>
            )}
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

          </View>
        )}
      </View>
    </View>
  );

  return (
    <View
      className={`${forceExpanded ? "bg-white dark:bg-neutral-900 border-2 border-blue-200 dark:border-blue-800" : "bg-white dark:bg-neutral-900"} rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800`}
    >
      <TouchableOpacity
        onPress={handleExpandToggle}
        className="p-4 flex-row items-center justify-between"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center flex-1">
          <View className="flex-row items-center">
            <Ionicons
              name="people-outline"
              size={20}
              color={Colors[colorScheme ?? "light"].text}
            />
            <ThemedText className="text-lg text-gray-700 dark:text-gray-300 font-semibold ml-2">
              Members ({members.length})
            </ThemedText>
          </View>
        </View>

        <View className="flex-row items-center">
          {!isExpanded && (
            <View className="flex-row items-center mr-3">
              {members
                .slice(0, 3)
                .map((member, index) => renderMemberPreview(member, index))}
              {members.length > 3 && (
                <View className="ml-2 w-8 h-8 rounded-full bg-gray-200 dark:bg-neutral-700 items-center justify-center">
                  <Text className="text-xs font-bold text-gray-600 dark:text-gray-300">
                    +{members.length - 3}
                  </Text>
                </View>
              )}
            </View>
          )}

          <Ionicons
            name={
              isExpanded
                ? forceExpanded
                  ? "close"
                  : "chevron-up"
                : "chevron-down"
            }
            size={20}
            color={Colors[colorScheme ?? "light"].text}
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View className="px-4 pb-4">
          <View className="border-t border-gray-100 dark:border-neutral-700 pt-4">
            {forceExpanded ? (
              <ScrollView
                className="max-h-60"
                showsVerticalScrollIndicator={false}
              >
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
              </ScrollView>
            ) : (
              <View>
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
            )}
          </View>
        </View>
      )}

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
