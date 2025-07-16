import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, TouchableOpacity, useColorScheme } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemedText } from "@/components/ThemedText";
import { RoomNotificationPage } from "@/components/notifications/RoomNotificationPage";
import { useSwapRequestsByRoomQuery } from "@/hooks/choreSwapHooks";
import { usePendingCompletionsByRoomQuery } from "@/hooks/choreHooks";
import {
  useRoomMembersQuery,
  useMembershipQuery,
} from "@/hooks/membershipHooks";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/user/useAuth";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import { Role } from "@/models/Membership";

const NotificationsScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  const roomId = Array.isArray(params.roomId)
    ? params.roomId[0]
    : typeof params.roomId === "string"
      ? params.roomId
      : undefined;

  const roomIdNum = roomId ? parseInt(roomId, 10) : 0;
  const permissions = usePermissions(isNaN(roomIdNum) ? 0 : roomIdNum);

  const { data: members = [] } = useRoomMembersQuery(roomId || "");
  const { data: swapRequests = [] } = useSwapRequestsByRoomQuery(roomIdNum);
  const { data: pendingCompletions = [] } =
    usePendingCompletionsByRoomQuery(roomIdNum);
  const { data: membership } = useMembershipQuery(user?.userId || 0, roomIdNum);

  const canVerify = permissions.hasPermission(Role.ADMIN);

  const currentUserMembership = members.find(
    (member) => member.userId === user?.userId
  );
  const currentMembershipId = currentUserMembership?.membershipId;

  const handleSwapRequestAction = () => {
    router.push(`/(tabs)/rooms/${roomId}/swap-requests`);
  };

  const handleVerificationAction = () => {
    router.push(`/(tabs)/rooms/${roomId}/verifications`);
  };

  if (!roomId) {
    return (
      <LoadingAndErrorHandling>
        <></>
      </LoadingAndErrorHandling>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black">
      <View className="bg-gray-50 dark:bg-neutral-950 px-6 pt-16 pb-4 border-b border-gray-200 dark:border-neutral-800">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-neutral-800 items-center justify-center mr-4"
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={colorScheme === "dark" ? "#d1d5db" : "#4b5563"}
            />
          </TouchableOpacity>
          <ThemedText className="text-xl font-bold text-gray-900 dark:text-white">
            Notifications
          </ThemedText>
        </View>
      </View>

      <View className="flex-1">
        <RoomNotificationPage
          swapRequests={swapRequests}
          pendingCompletions={pendingCompletions as any}
          onSwapRequestAction={handleSwapRequestAction}
          onVerificationAction={handleVerificationAction}
          isAdmin={canVerify}
          currentMembershipId={currentMembershipId}
          roomId={roomId}
        />
      </View>
    </View>
  );
};

export default NotificationsScreen;
