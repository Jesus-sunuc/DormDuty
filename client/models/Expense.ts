export interface Expense {
  expenseId: number;
  roomId: number;
  payerMembershipId: number;
  payerName: string;
  amount: number;
  description: string;
  category?: string;
  expenseDate: string;
  receiptUrl?: string;
  createdAt: string;
  splits: ExpenseSplit[];
}

export interface ExpenseSplit {
  splitId: number;
  expenseId: number;
  membershipId: number;
  amountOwed: number;
  isPaid: boolean;
  paidAt?: string;
  memberName: string;
}

export interface ExpenseCreateRequest {
  roomId: number;
  payerMembershipId: number;
  amount: number;
  description: string;
  category?: string;
  expenseDate: string;
  receiptUrl?: string;
  splitWith: number[];
}

export interface ExpenseUpdateRequest {
  expenseId: number;
  amount?: number;
  description?: string;
  category?: string;
  expenseDate?: string;
  receiptUrl?: string;
  splitWith?: number[];
}

export interface ExpensePaymentRequest {
  splitId: number;
  membershipId: number;
}

export interface ExpenseSummary {
  totalOwed: number;
  totalOwedToUser: number;
  netBalance: number;
}

export const EXPENSE_CATEGORIES = [
  "Groceries",
  "Utilities",
  "Rent",
  "Maintenance",
  "Cleaning Supplies",
  "Internet",
  "Cable/TV",
  "Furniture",
  "Appliances",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
