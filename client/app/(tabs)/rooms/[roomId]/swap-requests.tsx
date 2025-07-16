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
import { SwapRequestCard } from "@/components/chores/SwapRequestCard";
import { useSwapRequestsByRoomQuery } from "@/hooks/choreSwapHooks";
import { useRoomMembersQuery } from "@/hooks/membershipHooks";
import { useAuth } from "@/hooks/user/useAuth";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";

const SwapRequestsScreen = () => {
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

  const { data: members = [] } = useRoomMembersQuery(roomId || "");
  const { data: swapRequests = [], refetch: refetchSwapRequests } =
    useSwapRequestsByRoomQuery(roomIdNum);

  const currentUserMembership = members.find(
    (member) => member.userId === user?.userId
  );
  const currentMembershipId = currentUserMembership?.membershipId;

  const pendingRequestsForUser = swapRequests.filter(
    (request) =>
      request.status === "pending" &&
      request.toMembership === currentMembershipId
  );

  const handleRequestUpdate = () => {
    refetchSwapRequests();
  };

  if (!roomId || !currentMembershipId) {
    return (
      <LoadingAndErrorHandling>
        <></>
      </LoadingAndErrorHandling>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-neutral-950">
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
            Swap Requests
          </ThemedText>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {pendingRequestsForUser.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <View className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mb-4">
              <Ionicons name="swap-horizontal" size={32} color="#3b82f6" />
            </View>
            <ThemedText className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No swap requests
            </ThemedText>
            <ThemedText className="text-center text-gray-500 dark:text-gray-400 px-8">
              You don't have any pending chore swap requests at the moment.
            </ThemedText>
          </View>
        ) : (
          <View className="space-y-4">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-3">
                <Ionicons name="swap-horizontal" size={16} color="#3b82f6" />
              </View>
              <ThemedText className="text-lg font-semibold text-gray-900 dark:text-white">
                Pending Requests
              </ThemedText>
              <View className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <ThemedText className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {pendingRequestsForUser.length}
                </ThemedText>
              </View>
            </View>

            {pendingRequestsForUser.map((request) => (
              <SwapRequestCard
                key={request.swapId}
                request={request}
                currentMembershipId={currentMembershipId}
                onRequestUpdate={handleRequestUpdate}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SwapRequestsScreen;
