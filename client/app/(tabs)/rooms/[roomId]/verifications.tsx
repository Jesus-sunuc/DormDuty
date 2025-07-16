import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemedText } from "@/components/ThemedText";
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

      <ScrollView className="flex-1 px-6 py-6">
        {pendingCompletions.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <View className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={32} color="#f97316" />
            </View>
            <ThemedText className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              All caught up!
            </ThemedText>
            <ThemedText className="text-center text-gray-500 dark:text-gray-400 px-8">
              No pending chore completions to verify at the moment.
            </ThemedText>
          </View>
        ) : (
          <View className="space-y-4">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mr-3">
                <Ionicons name="checkmark-circle" size={16} color="#f97316" />
              </View>
              <ThemedText className="text-lg font-semibold text-gray-900 dark:text-white">
                Pending Verifications
              </ThemedText>
              <View className="ml-2 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <ThemedText className="text-xs font-medium text-orange-600 dark:text-orange-400">
                  {pendingCompletions.length}
                </ThemedText>
              </View>
            </View>

            {pendingCompletions.map((completion) => (
              <TouchableOpacity
                key={completion.completionId}
                onPress={() =>
                  router.push(
                    `/(tabs)/rooms/${roomId}/verifications/${completion.completionId}`
                  )
                }
                className="bg-white dark:bg-neutral-900 rounded-2xl p-5 mb-4 shadow-sm border-l-4 border-orange-500"
              >
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mr-3">
                    <Ionicons name="checkmark" size={18} color="#f97316" />
                  </View>
                  <View className="flex-1">
                    <ThemedText className="text-base font-semibold text-gray-900 dark:text-white">
                      {(completion as any).completedBy
                        ? `${(completion as any).completedBy} completed a chore`
                        : "Chore completion pending"}
                    </ThemedText>
                    <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                      {(() => {
                        try {
                          return new Date(
                            completion.completedAt
                          ).toLocaleDateString();
                        } catch {
                          return "Recently";
                        }
                      })()}
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#f97316" />
                </View>

                <View className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                  <View className="flex-row items-center justify-between">
                    <ThemedText className="text-sm font-medium text-orange-800 dark:text-orange-300">
                      {(completion as any).choreName
                        ? `Chore: ${(completion as any).choreName}`
                        : `Chore ID: ${completion.choreId}`}
                    </ThemedText>
                    {completion.photoUrl && (
                      <View className="flex-row items-center">
                        <Ionicons name="camera" size={14} color="#f97316" />
                        <ThemedText className="text-xs text-orange-600 dark:text-orange-400 ml-1">
                          Photo attached
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default VerificationsScreen;
