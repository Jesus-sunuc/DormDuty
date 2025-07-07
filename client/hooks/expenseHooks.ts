import { useQuery, useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";
import { camel_to_snake_serializing_date } from "@/utils/apiMapper";
import { getQueryClient } from "@/services/queryClient";
import {
  Expense,
  ExpenseCreateRequest,
  ExpensePaymentRequest,
  ExpenseSummary,
  ExpenseUpdateRequest,
} from "@/models/Expense";

const queryClient = getQueryClient();

export const expenseKeys = {
  all: ["expenses"] as const,
  byRoom: (roomId: number) => [...expenseKeys.all, "room", roomId] as const,
  byId: (expenseId: number) => [...expenseKeys.all, "id", expenseId] as const,
  summary: (membershipId: number, roomId: number) =>
    [...expenseKeys.all, "summary", membershipId, roomId] as const,
};

export const useRoomExpensesQuery = (roomId: number) =>
  useQuery({
    queryKey: expenseKeys.byRoom(roomId),
    queryFn: async (): Promise<Expense[]> => {
      const res = await axiosClient.get(`/api/expenses/room/${roomId}`);
      return res.data;
    },
    enabled: !!roomId && roomId > 0,
    staleTime: 2 * 60 * 1000,
  });

export const useExpenseByIdQuery = (expenseId: number) =>
  useQuery({
    queryKey: expenseKeys.byId(expenseId),
    queryFn: async (): Promise<Expense> => {
      const res = await axiosClient.get(`/api/expenses/${expenseId}`);
      return res.data;
    },
    enabled: !!expenseId && expenseId > 0,
    staleTime: 5 * 60 * 1000,
  });

export const useExpenseSummaryQuery = (membershipId: number, roomId: number) =>
  useQuery({
    queryKey: expenseKeys.summary(membershipId, roomId),
    queryFn: async (): Promise<ExpenseSummary> => {
      const res = await axiosClient.get(
        `/api/expenses/summary/user/${membershipId}/room/${roomId}`
      );
      return res.data;
    },
    enabled: !!membershipId && !!roomId && roomId > 0,
    staleTime: 1 * 60 * 1000,
  });

export const useCreateExpenseMutation = () =>
  useMutation({
    mutationFn: async (
      data: ExpenseCreateRequest
    ): Promise<{
      expenseId: number;
      amountPerPerson: number;
    }> => {
      const body = camel_to_snake_serializing_date(data);
      const res = await axiosClient.post("/api/expenses/create", body);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: expenseKeys.byRoom(variables.roomId),
      });
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      variables.splitWith.forEach((membershipId) => {
        queryClient.invalidateQueries({
          queryKey: expenseKeys.summary(membershipId, variables.roomId),
        });
      });
    },
  });

export const useMarkExpensePaidMutation = () =>
  useMutation({
    mutationFn: async (
      data: ExpensePaymentRequest
    ): Promise<{
      success: boolean;
      message: string;
    }> => {
      const body = camel_to_snake_serializing_date(data);
      const res = await axiosClient.post("/api/expenses/pay", body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });

export const useUpdateExpenseMutation = () =>
  useMutation({
    mutationFn: async (data: ExpenseUpdateRequest): Promise<Expense> => {
      const body = camel_to_snake_serializing_date(data);
      const res = await axiosClient.put(
        `/api/expenses/${data.expenseId}`,
        body
      );
      return res.data;
    },
    onSuccess: (updatedExpense) => {
      queryClient.invalidateQueries({
        queryKey: expenseKeys.byRoom(updatedExpense.roomId),
      });
      queryClient.invalidateQueries({
        queryKey: expenseKeys.byId(updatedExpense.expenseId),
      });
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });

export const useDeleteExpenseMutation = () =>
  useMutation({
    mutationFn: async (expenseId: number): Promise<{ success: boolean }> => {
      const res = await axiosClient.delete(`/api/expenses/${expenseId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
