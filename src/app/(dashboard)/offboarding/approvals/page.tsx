// src/app/(dashboard)/offboarding/approvals/page.tsx
// Sprint 11 F4 — Manager/HR exit approval page

import React from "react";
import { ExitApprovalPanel } from "@/features/offboarding/components/ExitApprovalPanel";

export default function ExitApprovalsPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Exit Request Approvals</h1>
      <ExitApprovalPanel />
    </div>
  );
}
