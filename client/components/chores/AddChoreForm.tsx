import React, { useState } from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import {
  TextInputField,
  PickerField,
  DatePickerField,
  TimePickerField,
} from "@/components/forms/FormFields";
import { frequencyOptions, daysOfWeek } from "@/constants/choreConstants";
import { MemberSelectionModal } from "@/components/MemberSelectionModal";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemedText } from "@/components/ThemedText";

interface Member {
  userId: number;
  name: string;
  membershipId: number;
  role: string;
}

interface AddChoreFormProps {
  name: string;
  setName: (name: string) => void;
  assignedTo: number[] | undefined;
  setAssignedTo: (membershipIds: number[] | undefined) => void;
  frequency: string;
  setFrequency: (frequency: string) => void;
  startDate: string | undefined;
  setStartDate: (date: string) => void;
  dayOfWeek: number | undefined;
  setDayOfWeek: (day: number | undefined) => void;
  timingInput: string;
  setTimingInput: (time: string) => void;
  description: string | undefined;
  setDescription: (description: string | undefined) => void;
  approvalRequired: boolean;
  setApprovalRequired: (required: boolean) => void;
  photoRequired: boolean;
  setPhotoRequired: (required: boolean) => void;
  members: Member[];
  onSave: () => void;
  isPending: boolean;
  isEdit?: boolean;
}

export const AddChoreForm: React.FC<AddChoreFormProps> = ({
  name,
  setName,
  assignedTo,
  setAssignedTo,
  frequency,
  setFrequency,
  startDate,
  setStartDate,
  dayOfWeek,
  setDayOfWeek,
  timingInput,
  setTimingInput,
  description,
  setDescription,
  approvalRequired,
  setApprovalRequired,
  photoRequired,
  setPhotoRequired,
  members,
  onSave,
  isPending,
  isEdit = false,
}) => {
  const [showMemberSelection, setShowMemberSelection] = useState(false);

  const safeMembers = Array.isArray(members)
    ? members.filter((member) => member != null)
    : [];

  const getAssignedMemberNames = () => {
    if (!assignedTo || assignedTo.length === 0) return "No one assigned";

    const assignedMembers = safeMembers.filter((member) =>
      assignedTo.includes(member.membershipId)
    );

    if (assignedMembers.length === 0) return "No one assigned";

    if (assignedMembers.length === 1) return assignedMembers[0].name;

    if (assignedMembers.length === 2) {
      return `${assignedMembers[0].name} and ${assignedMembers[1].name}`;
    }

    return `${assignedMembers[0].name} and ${assignedMembers.length - 1} others`;
  };

  const handleMemberSelection = () => {
    setShowMemberSelection(false);
  };

  const frequencyItems = frequencyOptions.map((option) => ({
    label: option,
    value: option,
  }));

  const dayItems = [
    { label: "No specific day", value: undefined, key: "no-specific-day" },
    ...daysOfWeek.map((day, index) => ({
      label: day,
      value: index,
      key: index.toString(),
    })),
  ];

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-black">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          <View className="bg-white dark:bg-neutral-900 rounded-3xl p-6 mb-6 shadow-lg border border-neutral-100 dark:border-neutral-700">
            <View className="flex-row items-center mb-6">
              <View className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mr-4">
                <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
              </View>
              <Text className="text-lg font-semibold text-neutral-900 dark:text-white">
                Chore Details
              </Text>
            </View>

            <View className="space-y-6">
              <TextInputField
                label="Chore Name"
                placeholder="Enter chore name"
                value={name}
                onChangeText={setName}
              />

              <View className="space-y-2">
                <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Assign to members
                </Text>
                <TouchableOpacity
                  onPress={() => setShowMemberSelection(true)}
                  className="flex-row items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700"
                >
                  <View className="flex-1">
                    <ThemedText className="text-neutral-900 dark:text-white">
                      {getAssignedMemberNames()}
                    </ThemedText>
                    {assignedTo && assignedTo.length > 0 && (
                      <ThemedText className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Assigned to {assignedTo.length} member
                        {assignedTo.length !== 1 ? "s" : ""}
                        {assignedTo.length > 1 &&
                          " (first member will be primary)"}
                      </ThemedText>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="bg-white dark:bg-neutral-900 rounded-3xl p-6 mb-6 shadow-lg border border-neutral-100 dark:border-neutral-700">
            <View className="flex-row items-center mb-6">
              <View className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full items-center justify-center mr-4">
                <Ionicons name="calendar" size={24} color="#8b5cf6" />
              </View>
              <Text className="text-lg font-semibold text-neutral-900 dark:text-white">
                Schedule
              </Text>
            </View>

            <View className="space-y-6">
              <PickerField
                label="Repetition"
                selectedValue={frequency}
                onValueChange={setFrequency}
                items={frequencyItems}
              />

              <DatePickerField
                label="Start Date"
                value={startDate}
                onDateChange={setStartDate}
                placeholder="Select a start date"
              />

              <PickerField
                label="Specific Day (Optional)"
                selectedValue={dayOfWeek}
                onValueChange={setDayOfWeek}
                items={dayItems}
              />

              <TimePickerField
                label="Time"
                value={timingInput}
                onTimeChange={setTimingInput}
                placeholder="Select time"
              />
            </View>
          </View>

          <View className="bg-white dark:bg-neutral-800 rounded-3xl p-6 mb-8 shadow-lg border border-neutral-100 dark:border-neutral-700">
            <View className="flex-row items-center mb-6">
              <View className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mr-4">
                <Ionicons name="document-text" size={24} color="#22c55e" />
              </View>
              <Text className="text-lg font-semibold text-neutral-900 dark:text-white">
                Description
              </Text>
            </View>

            <TextInputField
              label="Description (Optional)"
              placeholder="Describe this chore..."
              value={description || ""}
              onChangeText={(text) => setDescription(text || undefined)}
              multiline
              numberOfLines={6}
              style={{ minHeight: 120 }}
            />
          </View>

          <View className="bg-white dark:bg-neutral-900 rounded-3xl p-6 mb-8 shadow-lg border border-neutral-100 dark:border-neutral-700">
            <View className="flex-row items-center mb-6">
              <View className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full items-center justify-center mr-4">
                <Ionicons name="shield-checkmark" size={24} color="#f97316" />
              </View>
              <Text className="text-lg font-semibold text-neutral-900 dark:text-white">
                Approval Settings
              </Text>
            </View>

            <View className="space-y-4 gap-2">
              <View className="flex-row items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <View className="flex-1 mr-4">
                  <Text className="text-base font-medium text-neutral-900 dark:text-white">
                    Approval Required
                  </Text>
                  <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Require admin approval when members complete this chore
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setApprovalRequired(!approvalRequired);
                    if (!approvalRequired) {
                      setPhotoRequired(false);
                    }
                  }}
                  className={`w-12 h-7 rounded-full border ${
                    approvalRequired
                      ? "bg-blue-500 border-blue-500"
                      : "bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600"
                  }`}
                >
                  <View
                    className={`w-4 h-4 mt-1 rounded-full bg-white transition-transform ${
                      approvalRequired ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </TouchableOpacity>
              </View>

              {approvalRequired && (
                <View className="flex-row items-center justify-between p-4 ml-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <View className="flex-1 mr-4">
                    <Text className="text-base font-medium text-neutral-900 dark:text-white">
                      Photo Proof Required
                    </Text>
                    <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      Members must provide photo evidence when completing this
                      chore
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setPhotoRequired(!photoRequired)}
                    className={`w-12 h-7 rounded-full border ${
                      photoRequired
                        ? "bg-blue-500 border-blue-500"
                        : "bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600"
                    }`}
                  >
                    <View
                      className={`w-4 h-4 mt-1 rounded-full bg-white  transition-transform ${
                        photoRequired ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </TouchableOpacity>
                </View>
              )}

              <View className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Text className="text-sm text-blue-700 dark:text-blue-300">
                  💡{" "}
                  {approvalRequired
                    ? photoRequired
                      ? "Members will need to upload a photo and wait for admin approval when completing this chore."
                      : "Members will mark the chore as complete, but it will need admin approval before being considered finished."
                    : "Members can mark this chore as complete immediately without requiring approval."}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="pb-28 mt-2 ps-5 pe-5">
        <TouchableOpacity
          onPress={onSave}
          disabled={isPending || !name.trim()}
          className={`py-4 rounded-2xl flex-row items-center justify-center shadow-lg ${
            isPending || !name.trim()
              ? "bg-neutral-300 dark:bg-neutral-700"
              : "bg-blue-500"
          }`}
        >
          {isPending ? (
            <>
              <View className="w-5 h-5 border border-white/30 border-t-white rounded-full animate-spin mr-3" />
              <Text className="text-white font-semibold text-lg">
                {isEdit ? "Updating..." : "Creating..."}
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name={isEdit ? "checkmark-circle" : "add-circle"}
                size={24}
                color="white"
              />
              <Text className="text-white font-semibold text-lg ml-2">
                {isEdit ? "Update Chore" : "Create Chore"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <MemberSelectionModal
        isVisible={showMemberSelection}
        onClose={() => setShowMemberSelection(false)}
        members={safeMembers}
        selectedMemberIds={assignedTo || []}
        onSelectionChange={setAssignedTo}
        onConfirm={handleMemberSelection}
        title="Assign Chore"
        description="Select members to assign this chore to:"
        confirmButtonText="Assign"
        allowMultiple={true}
      />
    </View>
  );
};
