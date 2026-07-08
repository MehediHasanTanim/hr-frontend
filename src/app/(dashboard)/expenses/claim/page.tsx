// src/app/(dashboard)/expenses/claim/page.tsx
// Sprint 10 F6 — Expense Claim Submission Page

import React from "react";
import { ExpenseClaimForm } from "@/features/expenses/components/ExpenseClaimForm";

export default function ExpenseClaimPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Expense Claim</h1>
      <ExpenseClaimForm />
    </div>
  );
}
