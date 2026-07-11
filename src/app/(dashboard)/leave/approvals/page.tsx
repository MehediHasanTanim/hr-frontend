// src/app/(dashboard)/leave/approvals/page.tsx
import React from "react";
import { LeaveApprovalQueue } from "@/features/leave/components/LeaveApprovalQueue";

export default function LeaveApprovalsPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Leave Approvals</h1>
      <LeaveApprovalQueue />
    </div>
  );
}
