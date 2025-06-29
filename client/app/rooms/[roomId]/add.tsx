import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { useAddChoreMutation } from "@/hooks/choreHooks";
import { toastError, toastSuccess } from "@/components/ToastService";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "@/hooks/user/useAuth";
import { useRoomMembersQuery } from "@/hooks/membershipHooks";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform } from "react-native";

const frequencyOptions = [
  "Choose a day",
  "As Needed",
  "One Time",
  "Daily",
  "Every Other Day",
  "Every 3 Days",
  "Every 4 Days",
  "Every 5 Days",
  "Every 6 Days",
  "Weekly",
  "Every 10 Days",
  "Every Other Week",
  "Every 3 Weeks",
  "Every 4 Weeks",
  "Every 5 Weeks",
  "Every 6 Weeks",
  "Every 2 Months",
  "Every 3 Months",
  "Every 6 Months",
  "Yearly",
];
const daysOfWeek = [
  "Select a day",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const AddChoreScreen = () => {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: members = [] } = useRoomMembersQuery(roomId);

  const { mutate: addChore, isPending } = useAddChoreMutation();

  const [name, setName] = useState("New Chore");
  const [frequency, setFrequency] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<number | undefined>();
  const [timingInput, setTimingInput] = useState("");
  const [assignedTo, setAssignedTo] = useState<number | undefined>();
  const [startDate, setStartDate] = useState<string | undefined>();
  const [description, setDescription] = useState<string | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formattedMembers = (
    members as unknown as [number, string, number][]
  ).map(([userId, name, membershipId]) => ({
    userId,
    name,
    membershipId,
  }));

  const handleSubmit = () => {
    if (!name.trim() || !roomId) return;

    addChore(
      {
        roomId: parseInt(roomId),
        name: name.trim(),
        frequency,
        dayOfWeek,
        timing: timingInput ? `${timingInput}:00` : undefined,
        description: description?.trim(),
        startDate,
        assignedTo: assignedTo,
        isActive: true,
      },
      {
        onSuccess: () => {
          toastSuccess("Chore added!");
          router.back();
        },
        onError: () => toastError("Failed to add chore"),
      }
    );
  };

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | undefined>(undefined);

  const onTimeChange = (event: any, selected: Date | undefined) => {
    setShowTimePicker(false);
    if (selected) {
      setSelectedTime(selected);
      setTimingInput(selected.toTimeString().slice(0, 5)); 
    }
  };

  return (
    <ParallaxScrollView>
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-gray-600 dark:text-gray-400 text-lg">
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={isPending}
          onPress={handleSubmit}
          className="bg-customGreen-500 px-4 py-2 rounded-xl shadow"
        >
          <Text className="text-white font-semibold">Save</Text>
        </TouchableOpacity>
      </View>
      <ThemedText className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
        Create Chore
      </ThemedText>
      <TextInput
        placeholder="Chore name"
        placeholderTextColor="#9ca3af"
        value={name}
        onChangeText={setName}
        className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-4 text-lg text-black dark:text-white"
      />

      <ThemedText className="mb-0">Assign to</ThemedText>
      <View className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <Picker
          selectedValue={assignedTo}
          onValueChange={(value) => setAssignedTo(value)}
          style={{ color: "#9ca3af" }}
          dropdownIconColor="#9ca3af"
        >
          <Picker.Item label="Unassigned" value={undefined} key="unassigned" />
          {formattedMembers.map((member) => (
            <Picker.Item
              key={member.userId}
              label={member.name}
              value={member.userId}
            />
          ))}
        </Picker>
      </View>

      <ThemedText className="mb-1 mt-4">Repetition</ThemedText>
      <View className="border border-gray-300 dark:border-gray-600 rounded-lg mb-4 overflow-hidden">
        <Picker
          selectedValue={frequency}
          onValueChange={(itemValue) => setFrequency(itemValue)}
          style={{ color: "#9ca3af" }}
          dropdownIconColor="#9ca3af"
        >
          {frequencyOptions.map((option) => (
            <Picker.Item key={option} label={option} value={option} />
          ))}
        </Picker>
      </View>

      <ThemedText className="mb-1">Start Date</ThemedText>
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        className="border border-gray-300 dark:border-gray-600 rounded-lg mb-4 px-4 py-4"
      >
        <Text className="text-gray-700 dark:text-gray-400 text-lg">
          {startDate || "Select a start date"}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={startDate ? new Date(startDate) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === "ios");
            if (selectedDate) {
              const iso = selectedDate.toISOString().split("T")[0];
              setStartDate(iso);
            }
          }}
        />
      )}

      <ThemedText className="mb-1">Always on?</ThemedText>
      <View className="border border-gray-300 dark:border-gray-600 rounded-lg mb-4 overflow-hidden">
        <Picker
          selectedValue={dayOfWeek}
          onValueChange={(itemValue) => setDayOfWeek(itemValue)}
          style={{ color: "#9ca3af" }}
          dropdownIconColor="#9ca3af"
        >
          {daysOfWeek.map((day, index) => (
            <Picker.Item key={day} label={day} value={index} />
          ))}
        </Picker>
      </View>

      <ThemedText className="mb-1">Time</ThemedText>
      <TouchableOpacity
        onPress={() => setShowTimePicker(true)}
        className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-4 mb-4"
      >
        <Text className="text-gray-700 dark:text-gray-400 text-lg">
          {timingInput || "Select time"}
        </Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={selectedTime ?? new Date()}
          mode="time"
          is24Hour={true}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onTimeChange}
        />
      )}

      <ThemedText className="mb-1">Description</ThemedText>
      <TextInput
        placeholder="Describe this chore..."
        placeholderTextColor="#9ca3af"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 mb-4 text-black dark:text-white"
        style={{ minHeight: 120 }}
      />
    </ParallaxScrollView>
  );
};

export default AddChoreScreen;
