import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import {
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useExpenseByIdQuery,
} from "@/hooks/expenseHooks";
import {
  useRoomMembersQuery,
  useMembershipQuery,
} from "@/hooks/membershipHooks";
import {
  ExpenseCreateRequest,
  ExpenseUpdateRequest,
  EXPENSE_CATEGORIES,
} from "@/models/Expense";
import { toastSuccess, toastError } from "@/components/ToastService";
import { useAuth } from "@/hooks/user/useAuth";
import { Spinner } from "@/components/ui/Spinner";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";

const AddExpensePage = () => {
  const router = useRouter();
  const { roomId, edit, expenseId } = useLocalSearchParams<{
    roomId: string;
    edit?: string;
    expenseId?: string;
  }>();
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  const isEditMode = edit === "true" && expenseId;
  const expenseIdNum = parseInt(expenseId || "0", 10);
  const roomIdNum = parseInt(roomId || "0", 10);
  const userId = user?.userId || 0;

  // Fetch existing expense data if in edit mode
  const { data: existingExpense, isLoading: expenseLoading } =
    useExpenseByIdQuery(isEditMode ? expenseIdNum : 0);

  const { data: members = [] } = useRoomMembersQuery(roomId || "");
  const { data: membership } = useMembershipQuery(userId, roomIdNum);
  const { mutate: createExpense, isPending: createPending } =
    useCreateExpenseMutation();
  const { mutate: updateExpense, isPending: updatePending } =
    useUpdateExpenseMutation();

  const isPending = createPending || updatePending;

  const spinValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isPending) {
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();
      return () => spinAnimation.stop();
    }
  }, [isPending, spinValue]);

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    expenseDate: new Date(),
    splitWith: [membership?.membershipId || 0],
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Populate form data when editing an existing expense
  React.useEffect(() => {
    if (isEditMode && existingExpense) {
      // Check if the current user is the expense creator
      if (existingExpense.payerMembershipId !== membership?.membershipId) {
        toastError("You can only edit expenses you created");
        router.replace("/(tabs)/expenses");
        return;
      }

      setFormData({
        amount: existingExpense.amount.toString(),
        description: existingExpense.description,
        category: existingExpense.category || "",
        expenseDate: new Date(existingExpense.expenseDate),
        splitWith: existingExpense.splits.map((split) => split.membershipId),
      });
    }
  }, [isEditMode, existingExpense, membership?.membershipId, router]);

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

    if (isEditMode && existingExpense) {
      // Update existing expense
      const updateData: ExpenseUpdateRequest = {
        expenseId: existingExpense.expenseId,
        amount,
        description: formData.description.trim(),
        category: formData.category || undefined,
        expenseDate: formData.expenseDate.toISOString().split("T")[0],
        splitWith: formData.splitWith,
      };

      updateExpense(updateData, {
        onSuccess: () => {
          toastSuccess("Expense updated successfully!");
          router.replace("/(tabs)/expenses");
        },
        onError: () => {
          toastError("Failed to update expense");
        },
      });
    } else {
      // Create new expense
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
    }
  };

  const toggleMemberSelection = (membershipId: number) => {
    setFormData((prev) => ({
      ...prev,
      splitWith: prev.splitWith.includes(membershipId)
        ? prev.splitWith.filter((id) => id !== membershipId)
        : [...prev.splitWith, membershipId],
    }));
  };

  if (!roomId || !membership || (isEditMode && expenseLoading)) {
    return (
      <Spinner
        text={
          isEditMode ? "Loading expense data..." : "Loading expense form..."
        }
      />
    );
  }

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-black">
      <View className="bg-white/80 dark:bg-neutral-900 pt-16 pb-6 px-6 ">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/expenses")}
            className="w-10 h-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800"
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={Colors[colorScheme ?? "light"].text}
            />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <ThemedText className="text-2xl font-bold text-neutral-900 dark:text-gray-200">
              {isEditMode ? "Edit Expense" : "New Expense"}
            </ThemedText>
            <ThemedText className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {isEditMode
                ? "Update expense details"
                : "Split costs with your roommates"}
            </ThemedText>
          </View>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          <View className="bg-white dark:bg-neutral-900 rounded-3xl p-6 mb-6 shadow-lg border border-neutral-100 dark:border-neutral-700">
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mb-4">
                <Ionicons name="cash" size={32} color="#22c55e" />
              </View>
              <Text className="text-lg font-semibold text-neutral-900 dark:text-gray-300 mb-2">
                How much did you spend?
              </Text>
            </View>

            <View className="relative">
              <Text className="text-4xl font-light text-neutral-400 dark:text-neutral-500 absolute left-4 top-4">
                $
              </Text>
              <TextInput
                value={formData.amount}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, amount: text }))
                }
                placeholder="0.00"
                keyboardType="decimal-pad"
                className="text-4xl font-light text-neutral-900 dark:text-white text-center py-4 bg-neutral-50 dark:bg-black rounded-2xl"
                placeholderTextColor={
                  Colors[colorScheme ?? "light"].text + "40"
                }
              />
            </View>
          </View>

          <View className="bg-white dark:bg-neutral-900 rounded-3xl p-6 mb-6 shadow-lg border border-neutral-100 dark:border-neutral-700">
            <View className="flex-row items-center mb-6">
              <View className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mr-4">
                <Ionicons name="document-text" size={24} color="#3b82f6" />
              </View>
              <Text className="text-lg font-semibold text-neutral-900 dark:text-white">
                Expense Details
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">
                Description *
              </Text>
              <TextInput
                value={formData.description}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, description: text }))
                }
                placeholder="What was this expense for?"
                multiline
                numberOfLines={3}
                className="bg-neutral-50 dark:bg-black rounded-2xl p-4 text-neutral-900 dark:text-white min-h-[100px] text-base"
                placeholderTextColor={
                  Colors[colorScheme ?? "light"].text + "60"
                }
              />
            </View>

            <View className="flex-row space-x-4 mb-4 gap-3">
              <View className="flex-1">
                <Text className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">
                  Category
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                  className="bg-neutral-50 dark:bg-black rounded-2xl p-4 flex-row items-center justify-between"
                >
                  <Text className="text-neutral-900 dark:text-white flex-1">
                    {formData.category || "Select"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={Colors[colorScheme ?? "light"].text}
                  />
                </TouchableOpacity>
              </View>

              <View className="flex-1">
                <Text className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">
                  Date
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="bg-neutral-50 dark:bg-black rounded-2xl p-4 flex-row items-center justify-between"
                >
                  <Text className="text-neutral-900 dark:text-white flex-1">
                    {formData.expenseDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                  <Ionicons
                    name="calendar"
                    size={20}
                    color={Colors[colorScheme ?? "light"].text}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {showCategoryPicker && (
              <View className="bg-neutral-50 dark:bg-neutral-700 rounded-2xl mt-2 overflow-hidden">
                {EXPENSE_CATEGORIES.map((category, index) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => {
                      setFormData((prev) => ({ ...prev, category }));
                      setShowCategoryPicker(false);
                    }}
                    className={`p-4 ${
                      index < EXPENSE_CATEGORIES.length - 1
                        ? "border-b border-neutral-200 dark:border-neutral-600"
                        : ""
                    }`}
                  >
                    <Text className="text-neutral-900 dark:text-white">
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View className="bg-white dark:bg-neutral-900 rounded-3xl p-6 mb-8 shadow-lg border border-neutral-100 dark:border-neutral-700">
            <View className="flex-row items-center mb-6">
              <View className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full items-center justify-center mr-4">
                <Ionicons name="people" size={24} color="#8b5cf6" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Split With
                </Text>
                <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                  Select who to split this expense with
                </Text>
              </View>
            </View>

            <View>
              {members.map((member) => {
                const isSelected = formData.splitWith.includes(
                  member.membershipId
                );
                return (
                  <TouchableOpacity
                    key={member.membershipId}
                    onPress={() => toggleMemberSelection(member.membershipId)}
                    className={`p-4 mb-2 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500"
                        : "bg-neutral-50 dark:bg-black border-neutral-200 dark:border-neutral-600"
                    }`}
                  >
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-4">
                        <Text className="text-white font-bold text-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text
                          className={`font-medium ${
                            isSelected
                              ? "text-blue-900 dark:text-blue-200"
                              : "text-neutral-900 dark:text-white"
                          }`}
                        >
                          {member.name}
                          {member.membershipId === membership.membershipId && (
                            <Text className="text-sm text-neutral-500">
                              {" "}
                              (You)
                            </Text>
                          )}
                        </Text>
                      </View>
                      <View
                        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                          isSelected
                            ? "bg-blue-500 border-blue-500"
                            : "border-neutral-300 dark:border-neutral-500"
                        }`}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={14} color="white" />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="p-6">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isPending || !formData.amount || !formData.description}
          className={`py-4 rounded-2xl flex-row items-center justify-center shadow-lg ${
            isPending || !formData.amount || !formData.description
              ? "bg-neutral-300 dark:bg-neutral-700"
              : "bg-blue-600"
          }`}
        >
          {isPending ? (
            <>
              <Animated.View
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3"
                style={{
                  transform: [
                    {
                      rotate: spinValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                }}
              />
              <Text className="text-white font-semibold text-lg">
                {isEditMode ? "Updating..." : "Creating..."}
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name={isEditMode ? "checkmark-circle" : "add-circle"}
                size={24}
                color="white"
              />
              <Text className="text-white font-semibold text-lg ml-2">
                {isEditMode ? "Update Expense" : "Create Expense"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

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
