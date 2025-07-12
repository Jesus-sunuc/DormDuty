import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import { Header } from "@/components/ui/Header";
import { useSidebar } from "@/hooks/useSidebar";
import ParallaxScrollViewY from "@/components/ParallaxScrollViewY";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/hooks/user/useAuth";
import { useRoomsByUserQuery } from "@/hooks/roomHooks";
import {
  useMembershipQuery,
  useRoomMembersQuery,
} from "@/hooks/membershipHooks";
import {
  useRoomChecklistQuery,
  useCreateChecklistItemMutation,
  useDeleteChecklistItemMutation,
  useToggleTaskCompletionMutation,
  useAssignTaskMutation,
  useUnassignTaskMutation,
  useResetRoomTasksMutation,
  useInitializeRoomChecklistMutation,
} from "@/hooks/cleaningHooks";
import { CleaningChecklistWithStatus } from "@/models/CleaningChecklist";
import { Room } from "@/models/Room";
import { MemberSelectionModal } from "@/components/MemberSelectionModal";

const ToolsScreen = () => {
  const { openSidebar } = useSidebar();
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [newTaskName, setNewTaskName] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [showMemberSelection, setShowMemberSelection] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [currentDate] = useState(new Date().toISOString().split("T")[0]); // YYYY-MM-DD format

  // Queries
  const { data: rooms = [], isLoading: roomsLoading } = useRoomsByUserQuery();
  const { data: membership } = useMembershipQuery(
    user?.userId || 0,
    selectedRoom?.roomId || 0
  );
  const { data: roomMembers = [] } = useRoomMembersQuery(
    selectedRoom?.roomId?.toString() || ""
  );

  const { data: cleaningTasks = [], isLoading: tasksLoading } =
    useRoomChecklistQuery(selectedRoom?.roomId || 0, currentDate);

  // Mutations
  const createTaskMutation = useCreateChecklistItemMutation();
  const deleteTaskMutation = useDeleteChecklistItemMutation();
  const toggleTaskMutation = useToggleTaskCompletionMutation();
  const assignTaskMutation = useAssignTaskMutation();
  const unassignTaskMutation = useUnassignTaskMutation();
  const resetTasksMutation = useResetRoomTasksMutation();
  const initializeChecklistMutation = useInitializeRoomChecklistMutation();

  // Set default room
  useEffect(() => {
    if (rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(rooms[0]);
    }
  }, [rooms, selectedRoom]);

  // Initialize checklist if empty and room is selected
  useEffect(() => {
    if (selectedRoom && cleaningTasks.length === 0 && !tasksLoading) {
      initializeChecklistMutation.mutate(selectedRoom.roomId);
    }
  }, [selectedRoom, cleaningTasks.length, tasksLoading]);

  const addCustomTask = async () => {
    if (newTaskName.trim() && selectedRoom) {
      try {
        await createTaskMutation.mutateAsync({
          room_id: selectedRoom.roomId,
          title: newTaskName.trim(),
          description: undefined,
          is_default: false,
        });
        setNewTaskName("");
        setShowAddTask(false);
      } catch (error) {
        console.error("Failed to create task:", error);
      }
    }
  };

  const assignTask = async (membershipIds: number[]) => {
    if (!selectedTaskId || !selectedRoom || membershipIds.length === 0) return;

    try {
      await assignTaskMutation.mutateAsync({
        checklistItemId: selectedTaskId,
        membershipIds: membershipIds,
        markedDate: currentDate,
      });
    } catch (error) {
      console.error("Failed to assign task:", error);
    }
  };

  const unassignTask = async (checklistItemId: number) => {
    if (!selectedRoom) return;

    try {
      await unassignTaskMutation.mutateAsync({
        checklistItemId,
        markedDate: currentDate,
      });
    } catch (error) {
      console.error("Failed to unassign task:", error);
    }
  };

  const handleAssignClick = (taskId: number) => {
    setSelectedTaskId(taskId);
    setSelectedMemberIds([]);
    setShowMemberSelection(true);
  };

  const handleMemberSelectionConfirm = async () => {
    await assignTask(selectedMemberIds);
    setShowMemberSelection(false);
    setSelectedTaskId(null);
    setSelectedMemberIds([]);
  };

  const toggleTaskCompletion = async (
    checklistItemId: number,
    assignedMembershipIds?: string
  ) => {
    if (!selectedRoom) return;

    // Use the first assigned membership or current user's membership
    let membershipId = membership?.membershipId;
    if (assignedMembershipIds && assignedMembershipIds !== "0") {
      const ids = assignedMembershipIds
        .split(",")
        .map((id) => parseInt(id.trim()));
      membershipId = ids[0]; // Use the first assigned member
    }

    if (!membershipId) return;

    try {
      await toggleTaskMutation.mutateAsync({
        checklistItemId,
        membershipId,
        markedDate: currentDate,
      });
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  const removeCustomTask = async (checklistItemId: number) => {
    try {
      await deleteTaskMutation.mutateAsync(checklistItemId);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const resetAllTasks = async () => {
    if (!selectedRoom) return;

    try {
      await resetTasksMutation.mutateAsync({
        roomId: selectedRoom.roomId,
        markedDate: currentDate,
      });
    } catch (error) {
      console.error("Failed to reset tasks:", error);
    }
  };

  const isLoading =
    roomsLoading ||
    tasksLoading ||
    createTaskMutation.isPending ||
    deleteTaskMutation.isPending ||
    toggleTaskMutation.isPending ||
    assignTaskMutation.isPending ||
    unassignTaskMutation.isPending ||
    resetTasksMutation.isPending;

  return (
    <LoadingAndErrorHandling isLoading={isLoading}>
      <View className="flex-1 bg-gray-50 dark:bg-black">
        <Header title="Tools" onMenuPress={openSidebar} />

        <ParallaxScrollViewY>
          <View className="px-6 pt-6">
            {/* Cleaning Checks Section */}
            {selectedRoom && (
              <View key="cleaning-section" className="mb-8">
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#10b981"
                    />
                  </View>
                  <ThemedText className="text-xl font-semibold text-gray-900 dark:text-white">
                    Cleaning Checks
                  </ThemedText>
                </View>

                <ThemedText className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Create and manage cleaning templates for your dorm. Assign
                  tasks to members and track completion.
                </ThemedText>

                {/* Room Selection */}
                {rooms.length > 1 && (
                  <View
                    key="room-selection"
                    className="bg-white dark:bg-neutral-900 rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 dark:border-neutral-800"
                  >
                    <ThemedText className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Select Room
                    </ThemedText>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <View className="flex-row space-x-3">
                        {rooms.map((room) => (
                          <TouchableOpacity
                            key={room.roomId}
                            onPress={() => setSelectedRoom(room)}
                            className={`px-4 py-2 rounded-xl border ${
                              selectedRoom?.roomId === room.roomId
                                ? "bg-blue-500 border-blue-500"
                                : "bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700"
                            }`}
                          >
                            <ThemedText
                              className={`text-sm font-medium ${
                                selectedRoom?.roomId === room.roomId
                                  ? "text-white"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {room.name}
                            </ThemedText>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}

                {/* Cleaning Tasks */}
                <View className="bg-white dark:bg-neutral-900 rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 dark:border-neutral-800">
                  <View className="flex-row items-center justify-between mb-4">
                    <ThemedText className="text-lg font-medium text-gray-900 dark:text-white">
                      Cleaning Tasks
                    </ThemedText>
                    <TouchableOpacity
                      onPress={resetAllTasks}
                      className="px-3 py-1 bg-gray-100 dark:bg-neutral-800 rounded-lg"
                    >
                      <ThemedText className="text-xs text-gray-600 dark:text-gray-400">
                        Reset All
                      </ThemedText>
                    </TouchableOpacity>
                  </View>

                  {cleaningTasks.map((task, index) => (
                    <View
                      key={task.checklistItemId || `task-${index}`}
                      className={`flex-row items-center p-3 rounded-xl mb-2 ${
                        task.isCompleted
                          ? "bg-green-50 dark:bg-green-900/20"
                          : "bg-gray-50 dark:bg-neutral-800"
                      }`}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          toggleTaskCompletion(
                            task.checklistItemId,
                            task.assignedMembershipIds
                          )
                        }
                        className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                          task.isCompleted
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300 dark:border-neutral-600"
                        }`}
                      >
                        {task.isCompleted && (
                          <Ionicons name="checkmark" size={14} color="white" />
                        )}
                      </TouchableOpacity>

                      <View className="flex-1">
                        <ThemedText
                          className={`font-medium ${
                            task.isCompleted
                              ? "text-green-700 dark:text-green-300 line-through"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {task.title}
                        </ThemedText>
                        {task.assignedTo && (
                          <ThemedText className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Assigned to: {task.assignedTo}
                          </ThemedText>
                        )}
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          if (task.assignedTo) {
                            // Unassign task
                            unassignTask(task.checklistItemId);
                          } else {
                            // Show member selection modal
                            handleAssignClick(task.checklistItemId);
                          }
                        }}
                        className={`px-3 py-1 rounded-lg mr-2 ${
                          task.assignedTo
                            ? "bg-blue-100 dark:bg-blue-900/30"
                            : "bg-gray-200 dark:bg-neutral-700"
                        }`}
                      >
                        <ThemedText className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          {task.assignedTo ? "Unassign" : "Assign"}
                        </ThemedText>
                      </TouchableOpacity>

                      {!task.isDefault && (
                        <TouchableOpacity
                          onPress={() => removeCustomTask(task.checklistItemId)}
                          className="w-6 h-6 items-center justify-center"
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color="#ef4444"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}

                  {/* Add Custom Task */}
                  {showAddTask ? (
                    <View className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <TextInput
                        value={newTaskName}
                        onChangeText={setNewTaskName}
                        placeholder="Enter custom task name..."
                        className="bg-white dark:bg-neutral-800 rounded-lg p-3 text-gray-900 dark:text-white mb-3"
                        placeholderTextColor="#9ca3af"
                      />
                      <View className="flex-row space-x-2">
                        <TouchableOpacity
                          onPress={addCustomTask}
                          className="flex-1 bg-blue-500 rounded-lg py-2 items-center"
                        >
                          <ThemedText className="text-white font-medium">
                            Add Task
                          </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setShowAddTask(false);
                            setNewTaskName("");
                          }}
                          className="flex-1 bg-gray-300 dark:bg-neutral-700 rounded-lg py-2 items-center"
                        >
                          <ThemedText className="text-gray-700 dark:text-gray-300 font-medium">
                            Cancel
                          </ThemedText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setShowAddTask(true)}
                      className="mt-4 p-3 border-2 border-dashed border-gray-300 dark:border-neutral-600 rounded-xl items-center justify-center"
                    >
                      <View className="flex-row items-center">
                        <Ionicons
                          name="add-circle-outline"
                          size={20}
                          color="#6b7280"
                        />
                        <ThemedText className="text-gray-600 dark:text-gray-400 ml-2 font-medium">
                          Add Custom Task
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Coming Soon Section */}
            <View className="items-center justify-center py-20">
              <View className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mb-4">
                <Ionicons name="construct" size={40} color="#3b82f6" />
              </View>
              <ThemedText className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                More Tools Coming Soon
              </ThemedText>
              <ThemedText className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
                Additional utilities and tools for managing your dorm will be
                added here.
              </ThemedText>
            </View>
          </View>
        </ParallaxScrollViewY>
      </View>

      {/* Member Selection Modal */}
      <MemberSelectionModal
        isVisible={showMemberSelection}
        onClose={() => {
          setShowMemberSelection(false);
          setSelectedTaskId(null);
          setSelectedMemberIds([]);
        }}
        members={roomMembers}
        selectedMemberIds={selectedMemberIds}
        onSelectionChange={setSelectedMemberIds}
        onAssign={handleMemberSelectionConfirm}
        title="Assign Task"
      />
    </LoadingAndErrorHandling>
  );
};

export default ToolsScreen;
