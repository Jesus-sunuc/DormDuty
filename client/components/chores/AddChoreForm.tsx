import React from "react";
import { View } from "react-native";
import {
  TextInputField,
  PickerField,
  DatePickerField,
  TimePickerField,
} from "@/components/forms/FormFields";
import { frequencyOptions, daysOfWeek } from "@/constants/choreConstants";

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
}) => {
  const safeMembers = Array.isArray(members)
    ? members.filter((member) => member != null)
    : [];

  const memberItems = [
    { label: "Unassigned", value: undefined, key: "unassigned" },
    ...safeMembers.map((member) => ({
      label: member?.name || "Unknown",
      value: member?.userId,
      key: member?.userId?.toString() || `member-${Math.random()}`,
    })),
  ];

  const frequencyItems = frequencyOptions.map((option) => ({
    label: option,
    value: option,
  }));

  const dayItems = daysOfWeek.map((day, index) => ({
    label: day,
    value: index,
    key: index.toString(),
  }));

  return (
    <View className="px-6">
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
        label="Always on?"
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

      <TextInputField
        label="Description"
        placeholder="Describe this chore..."
        value={description || ""}
        onChangeText={(text) => setDescription(text || undefined)}
        multiline
        numberOfLines={6}
        style={{ minHeight: 120 }}
      />
    </View>
  );
};
