// src/features/expenses/components/ExpenseClaimForm.tsx
// Sprint 10 F6 — Expense claim submission form (RHF + Zod)

"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSubmitExpenseMutation } from "@/features/expenses/hooks/useSubmitExpenseMutation";
import { ReceiptUploadField } from "./ReceiptUploadField";
import {
  expenseClaimSchema,
  type ExpenseClaimFormValues,
} from "@/features/expenses/schemas/expense.schema";
import { formatCurrency } from "@/lib/utils";

const CATEGORIES = [
  "Travel",
  "Meals",
  "Office Supplies",
  "Software",
  "Training",
  "Other",
];

export function ExpenseClaimForm() {
  const submitMutation = useSubmitExpenseMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<ExpenseClaimFormValues>({
    resolver: zodResolver(expenseClaimSchema),
    defaultValues: {
      category: "",
      amount: 0,
      date: "",
      receiptS3Key: "",
      description: "",
    },
    mode: "onTouched",
  });

  const watchedAmount = watch("amount");

  const onSubmit = (data: ExpenseClaimFormValues) => {
    submitMutation.mutate(data, {
      onSuccess: () => {
        reset();
      },
    });
  };

  if (submitMutation.isSuccess && !submitMutation.isPending) {
    return (
      <div
        data-testid="expense-submit-success"
        className="rounded-md bg-green-50 border border-green-200 p-6 text-center"
      >
        <h3 className="text-lg font-semibold text-green-800">
          Expense Submitted
        </h3>
        <p className="mt-1 text-sm text-green-700">
          Your claim is pending approval.
        </p>
        <button
          type="button"
          data-testid="submit-another-expense"
          onClick={() => {
            reset();
            submitMutation.reset();
          }}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <form
      data-testid="expense-claim-form"
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-lg space-y-4"
    >
      <h3 className="text-lg font-semibold">New Expense Claim</h3>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          {...register("category")}
          data-testid="expense-category"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Select category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-xs text-destructive">
            {errors.category.message}
          </p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium mb-1">Amount</label>
        <Input
          type="number"
          step="0.01"
          min="0"
          {...register("amount", { valueAsNumber: true })}
          data-testid="expense-amount"
          placeholder="0.00"
        />
        {watchedAmount > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            {formatCurrency(watchedAmount)}
          </p>
        )}
        {errors.amount && (
          <p className="mt-1 text-xs text-destructive">
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <Input
          type="date"
          {...register("date")}
          data-testid="expense-date"
        />
        {errors.date && (
          <p className="mt-1 text-xs text-destructive">
            {errors.date.message}
          </p>
        )}
      </div>

      {/* Description (optional) */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Description (optional)
        </label>
        <textarea
          {...register("description")}
          data-testid="expense-description"
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Brief description..."
        />
      </div>

      {/* Receipt Upload */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Receipt <span className="text-destructive">*</span>
        </label>
        <Controller
          name="receiptS3Key"
          control={control}
          render={({ field }) => (
            <ReceiptUploadField
              value={field.value}
              onChange={field.onChange}
              error={errors.receiptS3Key?.message}
            />
          )}
        />
      </div>

      {/* Error banner */}
      {submitMutation.isError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          Failed to submit expense claim.
        </div>
      )}

      <button
        type="submit"
        data-testid="submit-expense-btn"
        disabled={submitMutation.isPending}
        className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {submitMutation.isPending ? (
          <Loader2 className="mx-auto h-4 w-4 animate-spin" />
        ) : (
          "Submit Expense"
        )}
      </button>
    </form>
  );
}
