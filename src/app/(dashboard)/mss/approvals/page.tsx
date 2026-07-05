// src/app/(dashboard)/mss/approvals/page.tsx
// Sprint 6 1.6.F4 — MSS Approvals Page (MANAGER, HR_ADMIN)

"use client";

import React from "react";
import { ApprovalQueue } from "@/features/mss/components/ApprovalQueue";

export default function MssApprovalsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Review and act on pending requests from your team.
        </p>
      </div>
      <ApprovalQueue />
    </div>
  );
}
