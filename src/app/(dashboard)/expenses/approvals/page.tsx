// src/app/(dashboard)/expenses/approvals/page.tsx
// Sprint 10 F6 — Expense Approvals Page (manager-facing)

import React from "react";
import { ExpenseApprovalQueue } from "@/features/expenses/components/ExpenseApprovalQueue";

export default function ExpenseApprovalsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Expense Approvals</h1>
      <ExpenseApprovalQueue />
    </div>
  );
}
