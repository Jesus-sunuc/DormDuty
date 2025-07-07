import React from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import {
  TextInputField,
  PickerField,
  DatePickerField,
  TimePickerField,
} from "@/components/forms/FormFields";
import { frequencyOptions, daysOfWeek } from "@/constants/choreConstants";
import Ionicons from "@expo/vector-icons/Ionicons";

interface Member {
  userId: number;
  name: string;
  membershipId: number;
}

interface AddChoreFormProps {
  name: string;
  setName: (name: string) => void;
  assignedTo: number | undefined;
  setAssignedTo: (userId: number | undefined) => void;
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
  members,
  onSave,
  isPending,
  isEdit = false,
}) => {
  const safeMembers = Array.isArray(members)
    ? members.filter((member) => member != null)
    : [];

  const memberItems = [
    { label: "Unassigned", value: undefined, key: "unassigned" },
    ...safeMembers.map((member) => ({
      label: member?.name || "Unknown",
      value: member?.membershipId,
      key: member?.membershipId?.toString() || `member-${Math.random()}`,
    })),
  ];

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

              <PickerField
                label="Assign to"
                selectedValue={assignedTo}
                onValueChange={setAssignedTo}
                items={memberItems}
              />
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
        </View>
      </ScrollView>

      <View className="p-6">
        <TouchableOpacity
          onPress={onSave}
          disabled={isPending || !name.trim()}
          className={`py-4 rounded-2xl flex-row items-center justify-center shadow-lg ${
            isPending || !name.trim()
              ? "bg-neutral-300 dark:bg-neutral-700"
              : "bg-blue-600"
          }`}
        >
          {isPending ? (
            <>
              <View className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
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
    </View>
  );
};
