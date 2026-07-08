// src/features/expenses/schemas/expense.schema.ts
// Sprint 10 — Expense Claim Zod Schemas

import { z } from "zod";

export const expenseClaimSchema = z.object({
  category: z.string().min(1),
  amount: z.number().positive().multipleOf(0.01),
  date: z.string().refine((d) => new Date(d) <= new Date(), {
    message: "Expense date cannot be in the future",
  }),
  receiptS3Key: z.string().min(1, "Receipt is required"),
  description: z.string().max(500).optional(),
});

export const rejectExpenseSchema = z.object({
  id: z.string().uuid(),
  rejectionReason: z.string().min(1, "A rejection reason is required").max(500),
});

export type ExpenseClaimFormValues = z.infer<typeof expenseClaimSchema>;
export type RejectExpenseFormValues = z.infer<typeof rejectExpenseSchema>;
