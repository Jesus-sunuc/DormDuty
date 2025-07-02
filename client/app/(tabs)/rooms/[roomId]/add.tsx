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
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";

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
    <LoadingAndErrorHandling>
      <View className="flex-1 bg-gray-50 dark:bg-black">
        {/* Enhanced Header */}
        <View className="bg-white dark:bg-neutral-900 px-6 pt-12 pb-6 shadow-lg">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center"
            >
              <Text className="text-gray-600 dark:text-gray-300 text-sm font-medium">✕</Text>
            </TouchableOpacity>
            
            <View className="flex-1 mx-4">
              <ThemedText className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                New Chore
              </ThemedText>
            </View>
            
            <TouchableOpacity
              disabled={isPending}
              onPress={handleSubmit}
              className="bg-green-500 px-4 py-2 rounded-full shadow-md"
            >
              <Text className="text-white font-semibold">Save</Text>
            </TouchableOpacity>
          </View>
          
          {/* Page Title */}
          <View className="mt-2">
            <ThemedText className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Create Chore
            </ThemedText>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
              <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                Add a new task to room #{roomId}
              </ThemedText>
            </View>
          </View>
        </View>

        <ParallaxScrollView>
          <View className="px-6 pt-6">
            {/* Chore Name Input */}
            <View className="mb-6">
              <ThemedText className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chore Name
              </ThemedText>
              <TextInput
                placeholder="Enter chore name"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
                className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl px-4 py-4 text-lg text-black dark:text-white shadow-sm"
              />
            </View>

            {/* Assign to */}
            <View className="mb-6">
              <ThemedText className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assign to
              </ThemedText>
              <View className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl overflow-hidden shadow-sm">
                <Picker
                  selectedValue={assignedTo}
                  onValueChange={(value) => setAssignedTo(value)}
                  style={{ color: "#374151" }}
                  dropdownIconColor="#9ca3af"
                >
                  <Picker.Item
                    label="Unassigned"
                    value={undefined}
                    key="unassigned"
                  />
                  {formattedMembers.map((member) => (
                    <Picker.Item
                      key={member.userId}
                      label={member.name}
                      value={member.userId}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Repetition */}
            <View className="mb-6">
              <ThemedText className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Repetition
              </ThemedText>
              <View className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl overflow-hidden shadow-sm">
                <Picker
                  selectedValue={frequency}
                  onValueChange={(itemValue) => setFrequency(itemValue)}
                  style={{ color: "#374151" }}
                  dropdownIconColor="#9ca3af"
                >
                  {frequencyOptions.map((option) => (
                    <Picker.Item key={option} label={option} value={option} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Start Date */}
            <View className="mb-6">
              <ThemedText className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </ThemedText>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl px-4 py-4 shadow-sm"
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
            </View>

            {/* Day of Week */}
            <View className="mb-6">
              <ThemedText className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Always on?
              </ThemedText>
              <View className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl overflow-hidden shadow-sm">
                <Picker
                  selectedValue={dayOfWeek}
                  onValueChange={(itemValue) => setDayOfWeek(itemValue)}
                  style={{ color: "#374151" }}
                  dropdownIconColor="#9ca3af"
                >
                  {daysOfWeek.map((day, index) => (
                    <Picker.Item key={day} label={day} value={index} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Time */}
            <View className="mb-6">
              <ThemedText className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time
              </ThemedText>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl px-4 py-4 shadow-sm"
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
            </View>

            {/* Description */}
            <View className="mb-6">
              <ThemedText className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </ThemedText>
              <TextInput
                placeholder="Describe this chore..."
                placeholderTextColor="#9ca3af"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl px-4 py-3 text-black dark:text-white shadow-sm"
                style={{ minHeight: 120 }}
              />
            </View>
          </View>
        </ParallaxScrollView>
      </View>
    </LoadingAndErrorHandling>
  );
};

export default AddChoreScreen;
