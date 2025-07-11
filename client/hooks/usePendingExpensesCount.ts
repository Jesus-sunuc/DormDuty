import { useRoomsByUserQuery } from "@/hooks/roomHooks";
import { useMembershipQuery } from "@/hooks/membershipHooks";
import { useRoomExpensesQuery } from "@/hooks/expenseHooks";
import { useAuth } from "./user/useAuth";
import { useMemo } from "react";

export const usePendingExpensesCount = () => {
  const { user } = useAuth();
  const { data: rooms, isLoading, error } = useRoomsByUserQuery();

  const roomIds = useMemo(() => {
    if (!rooms || isLoading || error) {
      return [];
    }
    return rooms.map((room) => room.roomId);
  }, [rooms, isLoading, error]);

  const MAX_ROOMS = 10;
  const paddedRoomIds = [
    ...roomIds,
    ...Array(MAX_ROOMS - roomIds.length).fill(0),
  ];
  const userIdToQuery = user?.userId || 0;

  const roomData = paddedRoomIds.slice(0, MAX_ROOMS).map((roomId) => {
    const membershipQuery = useMembershipQuery(userIdToQuery, roomId);
    const expensesQuery = useRoomExpensesQuery(roomId);

    return {
      roomId,
      membership: membershipQuery.data,
      expenses: expensesQuery.data || [],
      membershipLoading: membershipQuery.isLoading,
      expensesLoading: expensesQuery.isLoading,
    };
  });

  const totalPendingCount = useMemo(() => {
    if (isLoading || error || !rooms || !user) {
      return 0;
    }

    return roomData.reduce(
      (
        total,
        { roomId, membership, expenses, membershipLoading, expensesLoading },
        index
      ) => {
        if (index >= roomIds.length || roomIds[index] === 0) {
          return total;
        }

        if (membershipLoading || expensesLoading || !membership || !expenses) {
          return total;
        }

        const pendingForRoom = expenses.reduce((roomTotal, expense) => {
          if (!expense.splits) {
            return roomTotal;
          }

          const userSplit = expense.splits.find(
            (split) => split.membershipId === membership.membershipId
          );

          if (userSplit && !userSplit.isPaid) {
            return roomTotal + 1;
          }

          return roomTotal;
        }, 0);

        return total + pendingForRoom;
      },
      0
    );
  }, [isLoading, error, rooms, user, roomIds, roomData]);

  return totalPendingCount;
};
