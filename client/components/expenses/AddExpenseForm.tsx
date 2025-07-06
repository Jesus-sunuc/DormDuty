import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { useCreateExpenseMutation } from "@/hooks/expenseHooks";
import { useRoomMembersQuery } from "@/hooks/membershipHooks";
import { ExpenseCreateRequest, EXPENSE_CATEGORIES } from "@/models/Expense";
import { toastSuccess, toastError } from "@/components/ToastService";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";

interface AddExpenseFormProps {
  roomId: number;
  payerMembershipId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddExpenseForm: React.FC<AddExpenseFormProps> = ({
  roomId,
  payerMembershipId,
  onClose,
  onSuccess,
}) => {
  const colorScheme = useColorScheme();
  const { data: members = [] } = useRoomMembersQuery(roomId.toString());
  const { mutate: createExpense, isPending } = useCreateExpenseMutation();

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    expenseDate: new Date(),
    splitWith: [payerMembershipId],
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const handleSubmit = () => {
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
      roomId,
      payerMembershipId,
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
        onSuccess?.();
        onClose();
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

  return (
    <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-neutral-700">
      <View className="flex-row items-center justify-between mb-6">
        <ThemedText className="text-xl font-bold text-gray-900 dark:text-white">
          Add Expense
        </ThemedText>
        <TouchableOpacity
          onPress={onClose}
          className="p-2 rounded-full bg-gray-100 dark:bg-neutral-800"
        >
          <Ionicons
            name="close"
            size={20}
            color={Colors[colorScheme ?? "light"].text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
        {/* Amount */}
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

        {/* Description */}
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

        {/* Category */}
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

        {/* Date */}
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

        {/* Split With */}
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
                    {member.membershipId === payerMembershipId ? "(You)" : ""}
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
      </ScrollView>

      {/* Submit Button */}
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
