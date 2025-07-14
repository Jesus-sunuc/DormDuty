import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import { SwapRequestCard } from "@/components/chores/SwapRequestCard";
import {
  useSwapRequestsByUserQuery,
  usePendingSwapRequestsQuery,
} from "@/hooks/choreSwapHooks";
import { useAuth } from "@/hooks/user/useAuth";
import { useRoomMembersQuery } from "@/hooks/membershipHooks";
import Ionicons from "@expo/vector-icons/Ionicons";

const SwapRequestsScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<"all" | "pending">("pending");
  const [refreshing, setRefreshing] = useState(false);

  const roomId = Array.isArray(params.roomId)
    ? params.roomId[0]
    : params.roomId || "1";

  const { data: members = [] } = useRoomMembersQuery(roomId);
  const currentMembership = members.find(
    (member) => member.userId === user?.userId
  );
  const currentMembershipId = currentMembership?.membershipId;

  const {
    data: allRequests = [],
    isLoading: allLoading,
    error: allError,
    refetch: refetchAll,
  } = useSwapRequestsByUserQuery(currentMembershipId || 0);

  const {
    data: pendingRequests = [],
    isLoading: pendingLoading,
    error: pendingError,
    refetch: refetchPending,
  } = usePendingSwapRequestsQuery(currentMembershipId || 0);

  const isLoading = allLoading || pendingLoading;
  const error = allError || pendingError;

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchAll(), refetchPending()]);
    setRefreshing(false);
  };

  const currentRequests = activeTab === "all" ? allRequests : pendingRequests;

  if (!user || !currentMembershipId) {
    return (
      <LoadingAndErrorHandling>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="person-outline" size={64} color="#9ca3af" />
          <ThemedText className="text-center text-gray-500 mt-4 text-lg">
            Please log in to view swap requests
          </ThemedText>
        </View>
      </LoadingAndErrorHandling>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black">
      <View className="bg-white dark:bg-neutral-900 px-6 pt-12 pb-6 shadow-lg">
        <View className="flex-row items-center justify-between mb-4 mt-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#6b7280" />
          </TouchableOpacity>
          <View className="flex-1 mx-4">
            <ThemedText className="text-lg font-semibold text-center ">
              Chore Swap Requests
            </ThemedText>
          </View>
          <View className="w-10" />
        </View>

        <View className="flex-row bg-gray-100 dark:bg-neutral-800 rounded-xl p-1">
          <TouchableOpacity
            onPress={() => setActiveTab("pending")}
            className={`flex-1 py-2 px-4 rounded-lg ${
              activeTab === "pending"
                ? "bg-white dark:bg-neutral-700 shadow-sm"
                : ""
            }`}
          >
            <ThemedText
              className={`text-center font-medium ${
                activeTab === "pending"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Pending ({pendingRequests.length})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("all")}
            className={`flex-1 py-2 px-4 rounded-lg ${
              activeTab === "all"
                ? "bg-white dark:bg-neutral-700 shadow-sm"
                : ""
            }`}
          >
            <ThemedText
              className={`text-center font-medium ${
                activeTab === "all"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              All ({allRequests.length})
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <LoadingAndErrorHandling isLoading={isLoading} error={error}>
        <ScrollView
          className="flex-1 px-6 py-6"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {currentRequests.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons
                name="swap-horizontal-outline"
                size={64}
                color="#9ca3af"
              />
              <ThemedText className="text-center text-gray-500 mt-4 text-lg font-medium">
                {activeTab === "pending"
                  ? "No pending requests"
                  : "No swap requests yet"}
              </ThemedText>
              <ThemedText className="text-center text-gray-400 mt-2 text-sm">
                {activeTab === "pending"
                  ? "When someone requests to swap chores with you, they'll appear here"
                  : "Create a swap request from a chore details page"}
              </ThemedText>
            </View>
          ) : (
            <View>
              {currentRequests.map((request) => (
                <SwapRequestCard
                  key={request.swapId}
                  request={request}
                  currentMembershipId={currentMembershipId}
                  onRequestUpdate={handleRefresh}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </LoadingAndErrorHandling>
    </View>
  );
};

export default SwapRequestsScreen;
