import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { useCreateExpenseMutation } from "@/hooks/expenseHooks";
import {
  useRoomMembersQuery,
  useMembershipQuery,
} from "@/hooks/membershipHooks";
import { ExpenseCreateRequest, EXPENSE_CATEGORIES } from "@/models/Expense";
import { toastSuccess, toastError } from "@/components/ToastService";
import { useAuth } from "@/hooks/user/useAuth";
import { Spinner } from "@/components/ui/Spinner";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";

const AddExpensePage = () => {
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  const roomIdNum = parseInt(roomId || "0", 10);
  const userId = user?.userId || 0;

  const { data: members = [] } = useRoomMembersQuery(roomId || "");
  const { data: membership } = useMembershipQuery(userId, roomIdNum);
  const { mutate: createExpense, isPending } = useCreateExpenseMutation();

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    expenseDate: new Date(),
    splitWith: [membership?.membershipId || 0],
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  React.useEffect(() => {
    if (
      membership?.membershipId &&
      !formData.splitWith.includes(membership.membershipId)
    ) {
      setFormData((prev) => ({
        ...prev,
        splitWith: [membership.membershipId],
      }));
    }
  }, [membership?.membershipId]);

  const handleSubmit = () => {
    if (!membership?.membershipId) {
      toastError("Unable to find your membership information");
      return;
    }

    if (!formData.amount || !formData.description) {
      toastError("Please fill in amount and description");
      return;
    }

    if (formData.splitWith.length === 0) {
      toastError("Please select at least one person to split with");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toastError("Please enter a valid amount");
      return;
    }

    const expense: ExpenseCreateRequest = {
      roomId: roomIdNum,
      payerMembershipId: membership.membershipId,
      amount,
      description: formData.description.trim(),
      category: formData.category || undefined,
      expenseDate: formData.expenseDate.toISOString().split("T")[0],
      splitWith: formData.splitWith,
    };

    createExpense(expense, {
      onSuccess: (data) => {
        toastSuccess(
          `Expense created! Split amount: $${data.amountPerPerson.toFixed(2)} per person`
        );
        router.replace("/(tabs)/expenses");
      },
      onError: () => {
        toastError("Failed to create expense");
      },
    });
  };

  const toggleMemberSelection = (membershipId: number) => {
    setFormData((prev) => ({
      ...prev,
      splitWith: prev.splitWith.includes(membershipId)
        ? prev.splitWith.filter((id) => id !== membershipId)
        : [...prev.splitWith, membershipId],
    }));
  };

  if (!roomId || !membership) {
    return <Spinner text="Loading expense form..." />;
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-neutral-950">
      <View className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 pt-12 pb-4 px-6">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/expenses")}
            className="p-2 rounded-full bg-gray-100 dark:bg-neutral-800"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors[colorScheme ?? "light"].text}
            />
          </TouchableOpacity>
          <ThemedText className="text-xl font-bold text-gray-900 dark:text-white">
            Add Expense
          </ThemedText>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-neutral-800">
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount *
            </Text>
            <TextInput
              value={formData.amount}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, amount: text }))
              }
              placeholder="0.00"
              keyboardType="decimal-pad"
              className="border border-gray-300 dark:border-neutral-600 rounded-lg p-3 text-gray-900 dark:text-white bg-white dark:bg-neutral-800"
              placeholderTextColor={Colors[colorScheme ?? "light"].text + "80"}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </Text>
            <TextInput
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
              placeholder="What was this expense for?"
              multiline
              numberOfLines={2}
              className="border border-gray-300 dark:border-neutral-600 rounded-lg p-3 text-gray-900 dark:text-white bg-white dark:bg-neutral-800"
              placeholderTextColor={Colors[colorScheme ?? "light"].text + "80"}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </Text>
            <TouchableOpacity
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              className="border border-gray-300 dark:border-neutral-600 rounded-lg p-3 flex-row items-center justify-between bg-white dark:bg-neutral-800"
            >
              <Text className="text-gray-900 dark:text-white">
                {formData.category || "Select category"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={Colors[colorScheme ?? "light"].text}
              />
            </TouchableOpacity>

            {showCategoryPicker && (
              <View className="border border-gray-300 dark:border-neutral-600 rounded-lg mt-1 bg-white dark:bg-neutral-800">
                {EXPENSE_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => {
                      setFormData((prev) => ({ ...prev, category }));
                      setShowCategoryPicker(false);
                    }}
                    className="p-3 border-b border-gray-100 dark:border-neutral-700 last:border-b-0"
                  >
                    <Text className="text-gray-900 dark:text-white">
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="border border-gray-300 dark:border-neutral-600 rounded-lg p-3 flex-row items-center justify-between bg-white dark:bg-neutral-800"
            >
              <Text className="text-gray-900 dark:text-white">
                {formData.expenseDate.toLocaleDateString()}
              </Text>
              <Ionicons
                name="calendar"
                size={20}
                color={Colors[colorScheme ?? "light"].text}
              />
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Split with *
            </Text>
            <View className="border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800">
              {members.map((member, index) => {
                const isSelected = formData.splitWith.includes(
                  member.membershipId
                );
                return (
                  <TouchableOpacity
                    key={member.membershipId}
                    onPress={() => toggleMemberSelection(member.membershipId)}
                    className={`p-3 flex-row items-center justify-between ${
                      index > 0
                        ? "border-t border-gray-100 dark:border-neutral-700"
                        : ""
                    }`}
                  >
                    <Text className="text-gray-900 dark:text-white flex-1">
                      {member.name}{" "}
                      {member.membershipId === membership.membershipId
                        ? "(You)"
                        : ""}
                    </Text>
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        isSelected
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300 dark:border-neutral-600"
                      }`}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isPending}
            className={`py-4 rounded-2xl items-center ${
              isPending
                ? "bg-gray-300 dark:bg-neutral-700"
                : "bg-blue-500 dark:bg-blue-600"
            }`}
          >
            <Text className="text-white font-semibold text-lg">
              {isPending ? "Creating..." : "Create Expense"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={formData.expenseDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setFormData((prev) => ({ ...prev, expenseDate: date }));
            }
          }}
        />
      )}
    </View>
  );
};

export default AddExpensePage;
