import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import {
  useChoresByRoomQuery,
  usePendingCompletionsByRoomQuery,
} from "@/hooks/choreHooks";
import { useRoomByIdQuery } from "@/hooks/roomHooks";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import {
  View,
  Pressable,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatDate } from "../chores";
import {
  useRoomMembersQuery,
  useMembershipQuery,
} from "@/hooks/membershipHooks";
import { usePermissions } from "@/hooks/usePermissions";
import { RoomMembersList } from "@/components/rooms/RoomMembersList";
import ParallaxScrollViewY from "@/components/ParallaxScrollViewY";
import { Colors } from "@/constants/Colors";
import { useState, useEffect } from "react";
import { useSwapRequestsByRoomQuery } from "@/hooks/choreSwapHooks";
import { SwapRequestModal } from "@/components/chores/SwapRequestModal";
import { ChoreVerificationModalWrapper } from "@/components/chores/ChoreVerificationModalWrapper";
import { useAuth } from "@/hooks/user/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { Role } from "@/models/Membership";

const RoomChoresScreen = () => {
  const params = useLocalSearchParams();
  const roomId = Array.isArray(params.roomId)
    ? params.roomId[0]
    : typeof params.roomId === "string"
      ? params.roomId
      : undefined;

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const roomIdNum = roomId ? parseInt(roomId, 10) : 0;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const permissions = usePermissions(isNaN(roomIdNum) ? 0 : roomIdNum);
  const { data: room, isLoading: roomLoading } = useRoomByIdQuery(roomIdNum);
  const { data: members = [], refetch: refetchMembers } = useRoomMembersQuery(
    roomId || ""
  );
  const { data: swapRequests = [], refetch: refetchSwapRequests } =
    useSwapRequestsByRoomQuery(roomIdNum);

  const [membersExpanded, setMembersExpanded] = useState(false);
  const [showSwapRequestModal, setShowSwapRequestModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const { data: membership } = useMembershipQuery(user?.userId || 0, roomIdNum);

  const { data: pendingCompletions = [] } =
    usePendingCompletionsByRoomQuery(roomIdNum);

  const canVerify = permissions.hasPermission(Role.ADMIN);

  const router = useRouter();

  useEffect(() => {
    if (user?.userId) {
      queryClient.invalidateQueries({ queryKey: ["memberships"] });
      queryClient.invalidateQueries({ queryKey: ["chore-swap"] });
      refetchMembers();
      refetchSwapRequests();
    }
  }, [user?.userId, queryClient, refetchMembers, refetchSwapRequests]);

  const currentUserMembership = members.find(
    (member) => member.userId === user?.userId
  );
  const currentMembershipId = currentUserMembership?.membershipId;

  const pendingRequestsForUser = swapRequests.filter(
    (request) =>
      request.status === "pending" &&
      request.toMembership === currentMembershipId
  );

  const totalNotifications =
    pendingRequestsForUser.length + (canVerify ? pendingCompletions.length : 0);

  if (!roomId) {
    return (
      <LoadingAndErrorHandling>
        <></>
      </LoadingAndErrorHandling>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <LoadingAndErrorHandling>
        <View className="flex-1 bg-gray-50 dark:bg-black">
          <View className="bg-white dark:bg-neutral-900 px-6 pt-12 pb-6 shadow-lg">
            <View className="flex-row items-center justify-between mb-4 mt-6">
              <TouchableOpacity
                onPress={() => router.push("/")}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center"
              >
                <Ionicons name="arrow-back" size={20} color="#6b7280" />
              </TouchableOpacity>

              <View className="flex-1 mx-4">
                <ThemedText className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Room Chores
                </ThemedText>
              </View>

              {permissions.isAdmin && (
                <TouchableOpacity
                  onPress={() => router.push(`/(tabs)/rooms/${roomId}/add`)}
                  activeOpacity={0.8}
                  style={{
                    shadowColor: colors.shadowColor,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                  className="bg-emerald-100 dark:bg-emerald-900 px-2 py-2 rounded-xl border border-emerald-400 dark:border-emerald-500 flex-row items-center"
                >
                  <Ionicons
                    name="add"
                    size={17}
                    color={colorScheme === "dark" ? "white" : "#047857"}
                  />
                  <ThemedText className="text-emerald-700 dark:text-white font-semibold mr-1 text-sm">
                    Create
                  </ThemedText>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() =>
                  router.push(`/(tabs)/rooms/${roomId}/notifications`)
                }
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center ml-2 relative"
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#6b7280"
                />
                {totalNotifications > 0 && (
                  <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 items-center justify-center">
                    <ThemedText className="text-xs font-bold text-white">
                      {totalNotifications > 9 ? "9+" : totalNotifications}
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View className="mt-2">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <ThemedText className="text-2xl font-bold text-gray-900 dark:text-gray-300 mb-1">
                    {roomLoading
                      ? "Loading..."
                      : room?.name || `Room #${roomId}`}
                  </ThemedText>
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                    <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                      Manage and track chores
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <ParallaxScrollViewY>
            {roomId && <ChoreList roomId={roomId} />}
          </ParallaxScrollViewY>
          <View>
            {roomId &&
              roomId !== "undefined" &&
              roomId !== "" &&
              !membersExpanded && (
                <View className="mx-6 mb-6">
                  <RoomMembersList
                    roomId={roomId}
                    onExpandChange={setMembersExpanded}
                  />
                </View>
              )}
          </View>
        </View>
      </LoadingAndErrorHandling>

      {membersExpanded && roomId && roomId !== "undefined" && roomId !== "" && (
        <View>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setMembersExpanded(false)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              zIndex: 1000,
            }}
          />

          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              bottom: 24,
              left: 24,
              right: 24,
              zIndex: 1001,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 16,
              paddingBottom: 20,
            }}
          >
            <RoomMembersList
              roomId={roomId}
              onExpandChange={setMembersExpanded}
              forceExpanded={true}
            />
          </TouchableOpacity>
        </View>
      )}

      {canVerify && membership && (
        <ChoreVerificationModalWrapper
          isVisible={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          completions={pendingCompletions}
          verifierMembershipId={membership.membershipId}
          isAdmin={permissions.hasPermission(Role.ADMIN)}
        />
      )}

      {currentMembershipId && (
        <SwapRequestModal
          isVisible={showSwapRequestModal}
          onClose={() => setShowSwapRequestModal(false)}
          requests={pendingRequestsForUser}
          currentMembershipId={currentMembershipId}
          onRequestUpdate={refetchSwapRequests}
        />
      )}
    </View>
  );
};

export default RoomChoresScreen;

const ChoreList = ({ roomId }: { roomId: string }) => {
  const {
    data: chores = [],
    error: choresError,
    isLoading: choresLoading,
  } = useChoresByRoomQuery(roomId);
  const {
    data: members = [],
    error: membersError,
    isLoading: membersLoading,
  } = useRoomMembersQuery(roomId);

  const router = useRouter();

  const isLoading = choresLoading || membersLoading;
  const error = choresError || membersError;

  if (isLoading) {
    return (
      <LoadingAndErrorHandling
        isLoading={true}
        error={null}
        loadingText="Loading room data..."
      >
        <></>
      </LoadingAndErrorHandling>
    );
  }

  if (error) {
    return (
      <LoadingAndErrorHandling isLoading={false} error={error}>
        <></>
      </LoadingAndErrorHandling>
    );
  }

  if (!chores || !chores.length) {
    return (
      <View className="flex-1 items-center justify-center px-6 py-20">
        <Ionicons name="clipboard-outline" size={64} color="#9ca3af" />
        <ThemedText className="text-center text-gray-400 mt-4 text-lg font-medium">
          No chores yet
        </ThemedText>
        <ThemedText className="text-center text-gray-500 mt-2 text-sm">
          Add your first chore to get started with room management
        </ThemedText>
      </View>
    );
  }

  const memberMap = new Map(
    (members || []).map((member) => [
      member?.membershipId || 0,
      member?.name || "Unknown",
    ])
  );

  const getAssignedMemberDisplay = (chore: any) => {
    if (chore?.assignedMemberNames) {
      return chore.assignedMemberNames;
    }

    if (chore?.assignedMemberIds) {
      const memberIds = chore.assignedMemberIds
        .split(",")
        .map((id: string) => parseInt(id.trim()))
        .filter((id: number) => !isNaN(id));
      const assignedNames = memberIds
        .map((id: number) => memberMap.get(id))
        .filter(Boolean);
      if (assignedNames.length > 0) {
        if (assignedNames.length === 1) return assignedNames[0];
        if (assignedNames.length === 2)
          return `${assignedNames[0]} and ${assignedNames[1]}`;
        return `${assignedNames[0]} and ${assignedNames.length - 1} others`;
      }
    }

    const assignedMemberName = memberMap.get(chore?.assignedTo ?? -1);
    if (assignedMemberName) {
      return assignedMemberName;
    }

    return "Unassigned";
  };

  return (
    <View className="px-6 pt-6 pb-4">
      {chores.map((chore) => (
        <Pressable
          key={chore.choreId}
          onPress={() =>
            router.push(`/chore-details/${chore.choreId}?roomId=${roomId}`)
          }
          className="mb-4"
        >
          <View className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-neutral-800">
            <ThemedText className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-300">
              {chore?.name || "Unnamed Chore"}
            </ThemedText>

            <View className="space-y-2">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mr-2">
                    <Ionicons name="time-outline" size={12} color="#f59e0b" />
                  </View>
                  <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                    Last completed:
                  </ThemedText>
                </View>
                <ThemedText className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(chore?.lastCompleted) || "Never"}
                </ThemedText>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-2">
                    <Ionicons name="person-outline" size={12} color="#3b82f6" />
                  </View>
                  <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                    Assigned to:
                  </ThemedText>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  <ThemedText className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {getAssignedMemberDisplay(chore)}
                  </ThemedText>
                </View>
              </View>
            </View>

            <View className="absolute top-5 right-5">
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
};
