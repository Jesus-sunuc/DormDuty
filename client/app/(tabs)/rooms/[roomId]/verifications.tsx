import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, TouchableOpacity, useColorScheme } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemedText } from "@/components/ThemedText";
import { ChoreVerificationModalWrapper } from "@/components/chores/ChoreVerificationModalWrapper";
import { usePendingCompletionsByRoomQuery } from "@/hooks/choreHooks";
import { useMembershipQuery } from "@/hooks/membershipHooks";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/user/useAuth";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import { Role } from "@/models/Membership";

const VerificationsScreen = () => {
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

  const { data: pendingCompletions = [] } =
    usePendingCompletionsByRoomQuery(roomIdNum);
  const { data: membership } = useMembershipQuery(user?.userId || 0, roomIdNum);

  const canVerify = permissions.hasPermission(Role.ADMIN);

  if (!roomId || !canVerify || !membership) {
    return (
      <LoadingAndErrorHandling>
        <></>
      </LoadingAndErrorHandling>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-neutral-950">
      {/* Header */}
      <View className="bg-gray-50 dark:bg-neutral-950 px-6 pt-14 pb-4 border-b border-gray-200 dark:border-neutral-800">
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
            Pending Verifications
          </ThemedText>
        </View>
      </View>

      {/* Verification Modal as Full Screen */}
      <ChoreVerificationModalWrapper
        isVisible={true}
        onClose={() => router.back()}
        completions={pendingCompletions}
        verifierMembershipId={membership.membershipId}
        isAdmin={permissions.hasPermission(Role.ADMIN)}
      />
    </View>
  );
};

export default VerificationsScreen;
