import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import {
  useExpenseByIdQuery,
  useMarkExpensePaidMutation,
  useDeleteExpenseMutation,
} from "@/hooks/expenseHooks";
import { useAuth } from "@/hooks/user/useAuth";
import { useMembershipQuery } from "@/hooks/membershipHooks";
import { Spinner } from "@/components/ui/Spinner";
import Ionicons from "@expo/vector-icons/Ionicons";
import { toastSuccess, toastError } from "@/components/ToastService";

const ExpenseDetailPage = () => {
  const router = useRouter();
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const { user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const expenseIdNum = parseInt(expenseId || "0", 10);
  const userId = user?.userId || 0;

  const { data: expense, isLoading: expenseLoading } =
    useExpenseByIdQuery(expenseIdNum);
  const { data: membership } = useMembershipQuery(userId, expense?.roomId || 0);
  const { mutate: markAsPaid, isPending: paymentPending } =
    useMarkExpensePaidMutation();
  const { mutate: deleteExpense, isPending: deletePending } =
    useDeleteExpenseMutation();

  if (expenseLoading) {
    return <Spinner text="" />;
  }

  if (!expense) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="receipt-outline" size={64} color="#9ca3af" />
        <ThemedText className="text-center text-gray-400 mt-4 text-lg font-medium">
          Expense not found
        </ThemedText>
        <TouchableOpacity
          onPress={() => router.push("/expenses")}
          className="mt-4 bg-blue-500 px-6 py-2 rounded-xl"
        >
          <ThemedText className="text-white font-semibold">Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  const userSplit = expense.splits.find(
    (split) => split.membershipId === membership?.membershipId
  );

  const handlePayExpense = () => {
    if (!userSplit || !membership) {
      toastError("Unable to process payment");
      return;
    }
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    if (!userSplit || !membership) return;

    setShowPaymentModal(false);
    markAsPaid(
      {
        splitId: userSplit.splitId,
        membershipId: membership.membershipId,
      },
      {
        onSuccess: () => {
          toastSuccess("Payment marked as completed!");
          router.push("/expenses");
        },
        onError: (error) => {
          toastError("Failed to process payment");
          console.error("Payment error:", error);
        },
      }
    );
  };

  const handleEditExpense = () => {
    router.push(
      `/expenses-details/add?edit=true&expenseId=${expenseIdNum}&roomId=${expense.roomId}`
    );
  };

  const handleDeleteExpense = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setShowDeleteModal(false);
    deleteExpense(expenseIdNum, {
      onSuccess: () => {
        toastSuccess("Expense deleted successfully!");
        router.push("/expenses");
      },
      onError: (error) => {
        toastError("Failed to delete expense");
        console.error("Delete error:", error);
      },
    });
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 dark:bg-neutral-950">
      <View className="bg-gray-100 dark:bg-neutral-900 px-6 pt-16 pb-6 ">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.push("/expenses")}
              className="mr-4 p-2 rounded-full bg-gray-200 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700"
            >
              <Ionicons name="arrow-back" size={24} color="#4b5563" />
            </TouchableOpacity>
            <ThemedText className="text-2xl font-bold text-gray-800 dark:text-white">
              Expense Details
            </ThemedText>
          </View>

          {membership?.membershipId === expense.payerMembershipId && (
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={handleEditExpense}
                className="mr-3 p-2 rounded-full bg-blue-100 dark:bg-blue-900"
              >
                <Ionicons name="pencil" size={20} color="#3b82f6" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteExpense}
                disabled={deletePending}
                className="p-2 rounded-full bg-red-100 dark:bg-red-900"
              >
                {deletePending ? (
                  <Spinner text="" />
                ) : (
                  <Ionicons name="trash" size={20} color="#ef4444" />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View className="px-6 py-6">
        <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-neutral-800">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              {expense.category && (
                <View className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full flex-row items-center">
                  <Ionicons name="pricetag" size={14} color="#3b82f6" />
                  <ThemedText className="text-sm font-medium text-blue-800 dark:text-blue-200 ml-1">
                    {expense.category}
                  </ThemedText>
                </View>
              )}
            </View>
            <View className="flex-row items-center">
              <Ionicons name="card" size={24} color="#10b981" />
              <ThemedText className="text-3xl font-bold text-gray-800 dark:text-white ml-2">
                ${expense.amount.toFixed(2)}
              </ThemedText>
            </View>
          </View>

          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="document-text" size={20} color="#6b7280" />
              <ThemedText className="text-lg font-bold text-gray-800 dark:text-white ml-2">
                Description
              </ThemedText>
            </View>
            <ThemedText className="text-base text-gray-700 dark:text-gray-300 leading-relaxed ml-7">
              {expense.description}
            </ThemedText>
          </View>

          <View className="border-t border-gray-200 dark:border-neutral-700 pt-4">
            <View className="flex-row justify-between mb-2">
              <View className="flex-row items-center">
                <Ionicons name="person" size={16} color="#6b7280" />
                <ThemedText className="text-gray-700 dark:text-gray-400 ml-2">
                  Paid by:
                </ThemedText>
              </View>
              <ThemedText className="font-semibold text-gray-800 dark:text-white">
                {expense.payerName}
              </ThemedText>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={16} color="#6b7280" />
                <ThemedText className="text-gray-700 dark:text-gray-400 ml-2">
                  Date:
                </ThemedText>
              </View>
              <ThemedText className="font-semibold text-gray-800 dark:text-white">
                {new Date(expense.expenseDate).toLocaleDateString()}
              </ThemedText>
            </View>
          </View>
        </View>

        {userSplit &&
          membership?.membershipId !== expense.payerMembershipId && (
            <View className="bg-gray-100 dark:bg-neutral-900 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-neutral-800">
              <View className="flex-row items-center mb-4">
                <Ionicons name="person-circle" size={24} color="#3b82f6" />
                <ThemedText className="text-lg font-bold text-gray-800 dark:text-white ml-2">
                  Your Share
                </ThemedText>
              </View>

              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                  <Ionicons name="cash" size={18} color="#6b7280" />
                  <ThemedText className="text-gray-700 dark:text-gray-400 ml-2">
                    Amount owed:
                  </ThemedText>
                </View>
                <ThemedText className="text-xl font-bold text-red-500">
                  ${userSplit.amountOwed.toFixed(2)}
                </ThemedText>
              </View>

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Ionicons
                    name={userSplit.isPaid ? "checkmark-circle" : "time"}
                    size={18}
                    color="#6b7280"
                  />
                  <ThemedText className="text-gray-700 dark:text-gray-400 ml-2">
                    Status:
                  </ThemedText>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${
                    userSplit.isPaid
                      ? "bg-green-100 dark:bg-green-900"
                      : "bg-red-100 dark:bg-red-900"
                  }`}
                >
                  <ThemedText
                    className={`text-sm font-medium ${
                      userSplit.isPaid
                        ? "text-green-800 dark:text-green-200"
                        : "text-red-800 dark:text-red-200"
                    }`}
                  >
                    {userSplit.isPaid ? "Paid ✓" : "Pending"}
                  </ThemedText>
                </View>
              </View>
            </View>
          )}

        {membership?.membershipId === expense.payerMembershipId && (
          <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-neutral-800">
            <View className="flex-row items-center mb-4">
              <Ionicons name="people" size={24} color="#3b82f6" />
              <ThemedText className="text-lg font-bold text-gray-800 dark:text-white ml-2">
                Split Details
              </ThemedText>
            </View>

            {expense.splits.map((split, index) => (
              <View
                key={index}
                className="flex-row justify-between items-center py-2"
              >
                <View className="flex-row items-center flex-1">
                  <Ionicons
                    name="person-circle-outline"
                    size={20}
                    color="#6b7280"
                  />
                  <ThemedText className="text-gray-800 dark:text-white ml-2">
                    {split.memberName}
                  </ThemedText>
                </View>
                <View className="flex-row items-center">
                  <ThemedText className="text-gray-800 dark:text-white mr-2">
                    ${split.amountOwed.toFixed(2)}
                  </ThemedText>
                  <View
                    className={`px-2 py-1 rounded-full ${
                      split.isPaid
                        ? "bg-green-100 dark:bg-green-900"
                        : "bg-red-100 dark:bg-red-900"
                    }`}
                  >
                    <ThemedText
                      className={`text-xs font-medium ${
                        split.isPaid
                          ? "text-green-800 dark:text-green-200"
                          : "text-red-800 dark:text-red-200"
                      }`}
                    >
                      {split.isPaid ? "✓" : "•"}
                    </ThemedText>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {userSplit &&
          !userSplit.isPaid &&
          membership?.membershipId !== expense.payerMembershipId && (
            <TouchableOpacity
              onPress={handlePayExpense}
              disabled={paymentPending}
              className={`rounded-2xl p-4 flex-row items-center justify-center border ${
                paymentPending
                  ? "bg-gray-400 dark:bg-gray-600 border-gray-500 dark:border-gray-500"
                  : "bg-green-500 dark:bg-green-600 border-green-600 dark:border-green-500"
              }`}
            >
              {paymentPending ? (
                <Spinner text="" />
              ) : (
                <>
                  <Ionicons name="card" size={24} color="white" />
                  <ThemedText className="text-white font-semibold text-lg ml-2">
                    Mark as Paid - ${userSplit.amountOwed.toFixed(2)}
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          )}

        {userSplit &&
          userSplit.isPaid &&
          membership?.membershipId !== expense.payerMembershipId && (
            <View className="bg-green-100 dark:bg-green-900 rounded-2xl p-4 flex-row items-center justify-center border border-green-300 dark:border-green-700">
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <ThemedText className="text-green-800 dark:text-green-200 font-semibold text-lg ml-2">
                Already Paid
              </ThemedText>
            </View>
          )}
      </View>

      <ConfirmationModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={confirmPayment}
        title="Confirm Payment"
        message={`Are you sure you want to mark $${userSplit?.amountOwed.toFixed(2)} as paid?`}
        confirmText="Mark as Paid"
        cancelText="Cancel"
        icon="card"
      />

      <ConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Expense"
        message={`Are you sure you want to delete this expense? This action cannot be undone and will affect all room members.`}
        confirmText="Delete"
        cancelText="Cancel"
        icon="trash"
        destructive={true}
      />
    </ScrollView>
  );
};

export default ExpenseDetailPage;
