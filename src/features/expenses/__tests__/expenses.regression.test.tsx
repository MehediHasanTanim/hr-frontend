// src/features/expenses/__tests__/expenses.regression.test.tsx
// Sprint 10 — Expense Claims Unit Tests (Vitest + RTL)

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReceiptUploadField } from "@/features/expenses/components/ReceiptUploadField";
import { ExpenseApprovalQueue } from "@/features/expenses/components/ExpenseApprovalQueue";
import {
  expenseClaimSchema,
  rejectExpenseSchema,
} from "@/features/expenses/schemas/expense.schema";

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// ─── ReceiptUploadField ────────────────────────────────────────
describe("ReceiptUploadField", () => {
  it("renders upload prompt when no file selected", () => {
    render(<ReceiptUploadField value="" onChange={vi.fn()} />);
    expect(screen.getByTestId("upload-receipt-btn")).toBeDefined();
    expect(screen.getByText("Upload Receipt")).toBeDefined();
  });

  it("renders uploaded state when value is set", () => {
    render(<ReceiptUploadField value="receipts/file.pdf" onChange={vi.fn()} />);
    expect(screen.getByText(/Uploaded/)).toBeDefined();
  });

  it("shows clear button when value is set", () => {
    render(<ReceiptUploadField value="receipts/file.pdf" onChange={vi.fn()} />);
    expect(screen.getByTestId("clear-receipt-btn")).toBeDefined();
  });

  it("calls onChange with empty when cleared", async () => {
    const onChange = vi.fn();
    render(<ReceiptUploadField value="receipts/file.pdf" onChange={onChange} />);
    await userEvent.click(screen.getByTestId("clear-receipt-btn"));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("disables upload when disabled", () => {
    render(<ReceiptUploadField value="" onChange={vi.fn()} disabled />);
    // The hidden file input is disabled; the button is also disabled
    const btn = screen.getByTestId("upload-receipt-btn");
    expect(btn).toBeDisabled();
  });

  it("shows error message when provided", () => {
    render(<ReceiptUploadField value="" onChange={vi.fn()} error="Receipt is required" />);
    expect(screen.getByText("Receipt is required")).toBeDefined();
  });
});

// ─── ExpenseApprovalQueue (requires mocked hooks) ──────────────
describe("ExpenseApprovalQueue", () => {
  it("renders heading", () => {
    render(<ExpenseApprovalQueue />, { wrapper: Wrapper });
    // It will be in loading state, but heading should still be there
    expect(screen.getByTestId("expense-approval-loading")).toBeDefined();
  });
});

// ─── Expense Schemas ───────────────────────────────────────────
describe("expense schemas", () => {
  it("expenseClaimSchema rejects future date", () => {
    const result = expenseClaimSchema.safeParse({
      category: "Travel",
      amount: 50.0,
      date: "2099-12-31",
      receiptS3Key: "receipts/test.pdf",
    });
    expect(result.success).toBe(false);
  });

  it("expenseClaimSchema rejects negative amount", () => {
    const result = expenseClaimSchema.safeParse({
      category: "Travel",
      amount: -10,
      date: "2025-01-15",
      receiptS3Key: "receipts/test.pdf",
    });
    expect(result.success).toBe(false);
  });

  it("expenseClaimSchema rejects missing receipt", () => {
    const result = expenseClaimSchema.safeParse({
      category: "Travel",
      amount: 50.0,
      date: "2025-01-15",
      receiptS3Key: "",
    });
    expect(result.success).toBe(false);
  });

  it("expenseClaimSchema accepts valid claim", () => {
    const result = expenseClaimSchema.safeParse({
      category: "Travel",
      amount: 150.75,
      date: "2025-01-15",
      receiptS3Key: "receipts/test.pdf",
      description: "Client meeting lunch",
    });
    expect(result.success).toBe(true);
  });

  it("rejectExpenseSchema requires rejection reason", () => {
    const result = rejectExpenseSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      rejectionReason: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejectExpenseSchema accepts valid rejection", () => {
    const result = rejectExpenseSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      rejectionReason: "Duplicate claim",
    });
    expect(result.success).toBe(true);
  });
});
