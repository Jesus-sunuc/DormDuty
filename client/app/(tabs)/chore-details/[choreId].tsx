import { useLocalSearchParams, useRouter } from "expo-router";
import { useChoreByIdQuery } from "@/hooks/choreHooks";
import { ThemedText } from "@/components/ThemedText";
import { View, TouchableOpacity, Modal, Alert } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatDate } from "../chores";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import { useRoomMembersQuery } from "@/hooks/membershipHooks";
import ParallaxScrollViewY from "@/components/ParallaxScrollViewY";
import { useState } from "react";
import { ConfirmationModal } from "@/components/ConfirmationModal";

const ChoreDetailsScreen = () => {
  const { choreId, roomId } = useLocalSearchParams<{
    choreId: string;
    roomId?: string;
  }>();
  const router = useRouter();
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const choreIdNumber = choreId ? Number(choreId) : 0;
  const { data: chore } = useChoreByIdQuery(choreIdNumber);

  const effectiveRoomId =
    roomId || (chore?.roomId ? String(chore.roomId) : undefined);
  const { data: members = [] } = useRoomMembersQuery(effectiveRoomId || "");

  const memberMap = new Map(
    (members as unknown as [number, string, number][]).map(([userId, name]) => [
      userId,
      name,
    ])
  );

  const handleBack = () => {
    if (roomId) {
      router.push(`/rooms/${roomId}`);
    } else {
      router.push('/chores');
    }
  };

  const handleEdit = () => {
    setShowOptionsModal(false);
    // TODO: Navigate to edit chore screen
    Alert.alert("Edit Chore", "Edit functionality will be implemented soon");
  };

  const handleDelete = () => {
    setShowOptionsModal(false);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirmation(false);
    // TODO: Implement delete chore mutation
    Alert.alert("Delete", "Delete functionality will be implemented soon");
  };

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  if (!chore) {
    return (
      <LoadingAndErrorHandling>
        <View className="flex-1 bg-gray-50 dark:bg-black">
          <View className="bg-white dark:bg-neutral-900 px-6 pt-12 pb-6 shadow-lg">
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity 
                onPress={handleBack} 
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center"
              >
                <Ionicons name="arrow-back" size={20} color="#6b7280" />
              </TouchableOpacity>
              
              <View className="flex-1 mx-4">
                <ThemedText className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Chore Details
                </ThemedText>
              </View>
              
              <View className="w-10 h-10" />
            </View>
          </View>
          
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="alert-circle-outline" size={64} color="#9ca3af" />
            <ThemedText className="text-center text-gray-400 mt-4 text-lg">
              Chore not found
            </ThemedText>
            <ThemedText className="text-center text-gray-500 mt-2 text-sm">
              This chore may have been deleted or doesn't exist
            </ThemedText>
          </View>
        </View>
      </LoadingAndErrorHandling>
    );
  }

  return (
    <LoadingAndErrorHandling>
      <View className="flex-1 bg-gray-50 dark:bg-black">
        <View className="bg-white dark:bg-neutral-900 px-6 pt-12 pb-6 shadow-lg">
          <View className="flex-row items-center justify-between mb-4 mt-6">
            <TouchableOpacity 
              onPress={handleBack} 
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={20} color="#6b7280" />
            </TouchableOpacity>
            
            <View className="flex-1 mx-4">
              <ThemedText className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Chore Details
              </ThemedText>
            </View>
            
            <TouchableOpacity 
              onPress={() => setShowOptionsModal(true)}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center"
            >
              <Ionicons name="ellipsis-horizontal" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          <View className="mt-2">
            <ThemedText className="text-2xl font-bold text-gray-900 dark:text-gray-300 mb-1">
              {chore?.name || "Unnamed Chore"}
            </ThemedText>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                {memberMap.get(chore?.assignedTo ?? -1) || "Unassigned"}
              </ThemedText>
            </View>
          </View>
        </View>

        <ParallaxScrollViewY>
          <View className="px-6 pt-6">
            <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 shadow-sm">
              <ThemedText className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Chore Information
              </ThemedText>
              
              <View className="space-y-4">
                <View className="flex-row items-center py-2">
                  <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-3">
                    <Ionicons name="repeat" size={16} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                      Frequency
                    </ThemedText>
                    <ThemedText className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {chore?.frequency || "Not set"}
                    </ThemedText>
                  </View>
                </View>

                {chore?.startDate && (
                  <View className="flex-row items-center py-2">
                    <View className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
                      <Ionicons name="calendar" size={16} color="#10b981" />
                    </View>
                    <View className="flex-1">
                      <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                        Start Date
                      </ThemedText>
                      <ThemedText className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {formatDate(chore.startDate)}
                      </ThemedText>
                    </View>
                  </View>
                )}

                {chore?.dayOfWeek !== undefined && chore?.dayOfWeek !== null && (
                  <View className="flex-row items-center py-2">
                    <View className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center mr-3">
                      <Ionicons name="calendar-outline" size={16} color="#8b5cf6" />
                    </View>
                    <View className="flex-1">
                      <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                        Day of Week
                      </ThemedText>
                      <ThemedText className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {days[chore.dayOfWeek] || "Invalid day"}
                      </ThemedText>
                    </View>
                  </View>
                )}

                {chore?.timing && (
                  <View className="flex-row items-center py-2">
                    <View className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mr-3">
                      <Ionicons name="time-outline" size={16} color="#f59e0b" />
                    </View>
                    <View className="flex-1">
                      <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                        Due Time
                      </ThemedText>
                      <ThemedText className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {chore.timing}
                      </ThemedText>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {chore?.description && (
              <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 shadow-sm">
                <ThemedText className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Description
                </ThemedText>
                <ThemedText className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  {chore.description}
                </ThemedText>
              </View>
            )}
          </View>
        </ParallaxScrollViewY>

        <Modal
          visible={showOptionsModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowOptionsModal(false)}
        >
          <TouchableOpacity
            className="flex-1 bg-black/50 justify-end"
            activeOpacity={1}
            onPress={() => setShowOptionsModal(false)}
          >
            <View className="bg-white dark:bg-neutral-900 rounded-t-3xl p-6 pb-8">
              <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full self-center mb-6" />
              
              <ThemedText className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Chore Options
              </ThemedText>
              
              <TouchableOpacity
                onPress={handleEdit}
                className="flex-row items-center py-4 px-2 rounded-xl mb-2 active:bg-gray-100 dark:active:bg-neutral-800"
              >
                <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-3">
                  <Ionicons name="create-outline" size={20} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <ThemedText className="text-base font-medium text-gray-900 dark:text-white">
                    Edit Chore
                  </ThemedText>
                  <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                    Modify chore details
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleDelete}
                className="flex-row items-center py-4 px-2 rounded-xl active:bg-red-50 dark:active:bg-red-900/20"
              >
                <View className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mr-3">
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </View>
                <View className="flex-1">
                  <ThemedText className="text-base font-medium text-red-600 dark:text-red-400">
                    Delete Chore
                  </ThemedText>
                  <ThemedText className="text-sm text-red-500 dark:text-red-400">
                    Remove this chore permanently
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <ConfirmationModal
          visible={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={confirmDelete}
          title="Delete Chore"
          message={`Are you sure you want to delete "${chore?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          destructive={true}
          icon="trash-outline"
        />
      </View>
    </LoadingAndErrorHandling>
  );
};

export default ChoreDetailsScreen;
