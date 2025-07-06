import { useState } from "react";
import { View, TouchableOpacity, Modal, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/hooks/user/useAuth";
import { useRoomsByUserQuery } from "@/hooks/roomHooks";
import { useMembershipQuery } from "@/hooks/membershipHooks";
import {
  useRoomExpensesQuery,
  useExpenseSummaryQuery,
} from "@/hooks/expenseHooks";
import { AddExpenseForm } from "@/components/expenses/AddExpenseForm";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import ParallaxScrollViewY from "@/components/ParallaxScrollViewY";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Room } from "@/models/Room";
import { Expense } from "@/models/Expense";

const ExpensesScreen = () => {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const {
    data: rooms = [],
    isLoading: roomsLoading,
    error: roomsError,
  } = useRoomsByUserQuery();

  if (roomsLoading) {
    return (
      <LoadingAndErrorHandling isLoading={true}>
        <View />
      </LoadingAndErrorHandling>
    );
  }

  if (roomsError) {
    return (
      <LoadingAndErrorHandling error={roomsError}>
        <View />
      </LoadingAndErrorHandling>
    );
  }

  if (rooms.length === 0) {
    return (
      <ParallaxScrollViewY>
        <View className="flex-1 items-center justify-center px-6 py-20">
          <Ionicons name="receipt-outline" size={64} color="#9ca3af" />
          <ThemedText className="text-center text-gray-400 mt-4 text-lg font-medium">
            No rooms yet
          </ThemedText>
          <ThemedText className="text-center text-gray-500 mt-2 text-sm">
            Join or create a room to start tracking expenses
          </ThemedText>
        </View>
      </ParallaxScrollViewY>
    );
  }

  const currentRoom = selectedRoom || (rooms.length === 1 ? rooms[0] : null);

  return (
    <ParallaxScrollViewY>
      <View className="px-6 pt-20">
        {rooms.length > 1 && (
          <View className="mb-6">
            <ThemedText className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Select Room
            </ThemedText>
            <FlatList
              data={rooms}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(room) => room.roomId.toString()}
              renderItem={({ item: room }) => (
                <TouchableOpacity
                  onPress={() => setSelectedRoom(room)}
                  className={`mr-3 px-4 py-2 rounded-2xl border ${
                    currentRoom?.roomId === room.roomId
                      ? "bg-blue-500 border-blue-500"
                      : "bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700"
                  }`}
                >
                  <ThemedText
                    className={`font-medium ${
                      currentRoom?.roomId === room.roomId
                        ? "text-white"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {room.name}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {currentRoom && (
          <RoomExpenseContent
            room={currentRoom}
            userId={user?.userId || 0}
            onAddExpense={() => setShowAddExpense(true)}
          />
        )}

        {currentRoom && (
          <AddExpenseModal
            visible={showAddExpense}
            room={currentRoom}
            userId={user?.userId || 0}
            onClose={() => setShowAddExpense(false)}
          />
        )}
      </View>
    </ParallaxScrollViewY>
  );
};

interface RoomExpenseContentProps {
  room: Room;
  userId: number;
  onAddExpense: () => void;
}

const RoomExpenseContent: React.FC<RoomExpenseContentProps> = ({
  room,
  userId,
  onAddExpense,
}) => {
  const colorScheme = useColorScheme();
  const { data: membership } = useMembershipQuery(userId, room.roomId);
  const { data: expenses = [], isLoading: expensesLoading } =
    useRoomExpensesQuery(room.roomId);
  const { data: summary } = useExpenseSummaryQuery(
    membership?.membershipId || 0,
    room.roomId
  );

  if (expensesLoading) {
    return (
      <LoadingAndErrorHandling isLoading={true}>
        <View />
      </LoadingAndErrorHandling>
    );
  }

  return (
    <View>
      {summary && (
        <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 shadow-sm border border-gray-100 dark:border-neutral-800">
          <ThemedText className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
            Your Balance
          </ThemedText>

          <View className="space-y-3">
            <View className="flex-row justify-between">
              <ThemedText className="text-gray-600 dark:text-gray-400">
                You owe:
              </ThemedText>
              <ThemedText className="font-semibold text-red-500">
                ${summary.totalOwed.toFixed(2)}
              </ThemedText>
            </View>

            <View className="flex-row justify-between">
              <ThemedText className="text-gray-600 dark:text-gray-400">
                You're owed:
              </ThemedText>
              <ThemedText className="font-semibold text-green-500">
                ${summary.totalOwedToUser.toFixed(2)}
              </ThemedText>
            </View>

            <View className="border-t border-gray-200 dark:border-neutral-700 pt-3">
              <View className="flex-row justify-between">
                <ThemedText className="font-bold text-gray-900 dark:text-white">
                  Net:
                </ThemedText>
                <ThemedText
                  className={`font-bold ${
                    summary.netBalance >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  ${Math.abs(summary.netBalance).toFixed(2)}{" "}
                  {summary.netBalance >= 0 ? "credit" : "debt"}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity
        onPress={onAddExpense}
        className="bg-blue-500 dark:bg-blue-600 rounded-2xl p-4 mb-6 flex-row items-center justify-center shadow-sm"
      >
        <Ionicons name="add" size={24} color="white" />
        <ThemedText className="text-white font-semibold text-lg ml-2">
          Add Expense
        </ThemedText>
      </TouchableOpacity>

      <View>
        <ThemedText className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          Recent Expenses ({expenses.length})
        </ThemedText>

        {expenses.length === 0 ? (
          <View className="bg-white dark:bg-neutral-900 rounded-2xl p-8 items-center shadow-sm border border-gray-100 dark:border-neutral-800">
            <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
            <ThemedText className="text-center text-gray-400 mt-3 text-base font-medium">
              No expenses yet
            </ThemedText>
            <ThemedText className="text-center text-gray-500 mt-1 text-sm">
              Add your first expense to start tracking
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={expenses}
            keyExtractor={(expense) => expense.expenseId.toString()}
            renderItem={({ item: expense }) => (
              <ExpenseCard
                expense={expense}
                currentUserMembershipId={membership?.membershipId}
              />
            )}
            scrollEnabled={false}
          />
        )}
      </View>
    </View>
  );
};

interface ExpenseCardProps {
  expense: Expense;
  currentUserMembershipId?: number;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  currentUserMembershipId,
}) => {
  const colorScheme = useColorScheme();

  const userSplit = expense.splits.find(
    (split) => split.membershipId === currentUserMembershipId
  );

  return (
    <View className="bg-white dark:bg-neutral-900 rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 dark:border-neutral-800">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <ThemedText className="font-semibold text-gray-900 dark:text-white">
            {expense.description}
          </ThemedText>
          {expense.category && (
            <ThemedText className="text-sm text-blue-500 mt-1">
              {expense.category}
            </ThemedText>
          )}
        </View>
        <ThemedText className="font-bold text-lg text-gray-900 dark:text-white">
          ${expense.amount.toFixed(2)}
        </ThemedText>
      </View>

      <View className="flex-row justify-between items-center">
        <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
          Paid by {expense.payerName} •{" "}
          {new Date(expense.expenseDate).toLocaleDateString()}
        </ThemedText>

        {userSplit && (
          <View
            className={`px-3 py-1 rounded-full ${
              userSplit.isPaid
                ? "bg-green-100 dark:bg-green-900"
                : "bg-red-100 dark:bg-red-900"
            }`}
          >
            <ThemedText
              className={`text-xs font-medium ${
                userSplit.isPaid
                  ? "text-green-800 dark:text-green-200"
                  : "text-red-800 dark:text-red-200"
              }`}
            >
              ${userSplit.amountOwed.toFixed(2)}{" "}
              {userSplit.isPaid ? "✓" : "pending"}
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
};

interface AddExpenseModalProps {
  visible: boolean;
  room: Room;
  userId: number;
  onClose: () => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  visible,
  room,
  userId,
  onClose,
}) => {
  const { data: membership } = useMembershipQuery(userId, room.roomId);

  if (!membership) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 p-4">
        <View className="w-full max-w-md">
          <AddExpenseForm
            roomId={room.roomId}
            payerMembershipId={membership.membershipId}
            onClose={onClose}
            onSuccess={() => {
              // Optional: Add any success handling here
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default ExpensesScreen;
