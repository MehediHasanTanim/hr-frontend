// src/features/expenses/types/expenses.types.ts
// Sprint 10 — Expense Claim & Approval Types

export type ExpenseStatus = "PENDING" | "APPROVED" | "REJECTED" | "PAID";

export interface ExpenseClaimDto {
  category: string;
  amount: number;
  date: string;
  receiptS3Key: string;
  description?: string;
}

export interface ExpenseClaim {
  id: string;
  employeeId: string;
  employeeName: string;
  category: string;
  amount: number;
  date: string;
  status: ExpenseStatus;
  receiptS3Key: string;
  description?: string;
  submittedAt: string;
}

export interface ApproveExpenseDto {
  id: string;
}

export interface RejectExpenseDto {
  id: string;
  rejectionReason: string;
}
