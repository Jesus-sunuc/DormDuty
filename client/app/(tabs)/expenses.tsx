import { useState, useEffect } from "react";
import { View, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/hooks/user/useAuth";
import { useRoomsByUserQuery } from "@/hooks/roomHooks";
import { useMembershipQuery } from "@/hooks/membershipHooks";
import {
  useRoomExpensesQuery,
  useExpenseSummaryQuery,
} from "@/hooks/expenseHooks";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import { Spinner } from "@/components/ui/Spinner";
import ParallaxScrollViewY from "@/components/ParallaxScrollViewY";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Room } from "@/models/Room";
import { Expense } from "@/models/Expense";

const ExpensesScreen = () => {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const {
    data: rooms = [],
    isLoading: roomsLoading,
    error: roomsError,
  } = useRoomsByUserQuery();

  useEffect(() => {
    if (rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(rooms[0]);
    }
  }, [rooms, selectedRoom]);

  if (roomsLoading) {
    return (
      <LoadingAndErrorHandling isLoading={true} loadingText="">
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

  const currentRoom = selectedRoom;

  return (
    <>
      <View className="bg-white dark:bg-neutral-900 px-6 pt-16 shadow-lg">
        {rooms.length > 1 && (
          <View className="mb-6">
            <ThemedText className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-300">
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
                      ? "bg-blue-500 border-blue-400"
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
      </View>
      <ParallaxScrollViewY>
        <View className="px-6 pt-6">
          {currentRoom && (
            <RoomExpenseContent room={currentRoom} userId={user?.userId || 0} />
          )}
        </View>
      </ParallaxScrollViewY>
    </>
  );
};

interface RoomExpenseContentProps {
  room: Room;
  userId: number;
}

const RoomExpenseContent: React.FC<RoomExpenseContentProps> = ({
  room,
  userId,
}) => {
  const router = useRouter();
  const { data: membership, isLoading: membershipLoading } = useMembershipQuery(
    userId,
    room.roomId
  );
  const { data: expenses = [], isLoading: expensesLoading } =
    useRoomExpensesQuery(room.roomId);
  const { data: summary, isLoading: summaryLoading } = useExpenseSummaryQuery(
    membership?.membershipId || 0,
    room.roomId
  );

  if (expensesLoading || membershipLoading || summaryLoading) {
    return <Spinner text="" />;
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
        onPress={() =>
          router.push(`/expenses-details/add?roomId=${room.roomId}`)
        }
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
  const router = useRouter();
  const userSplit = expense.splits.find(
    (split) => split.membershipId === currentUserMembershipId
  );

  return (
    <TouchableOpacity
      onPress={() => router.push(`/expenses-details/${expense.expenseId}`)}
      className="bg-white dark:bg-neutral-900 rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 dark:border-neutral-800"
    >
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
    </TouchableOpacity>
  );
};

export default ExpensesScreen;
