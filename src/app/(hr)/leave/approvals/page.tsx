"use client";

import { LeaveApprovalQueue } from "@/features/leave/components/LeaveApprovalQueue";

export default function LeaveApprovalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Leave Approvals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and manage leave requests
        </p>
      </div>

      <LeaveApprovalQueue />
    </div>
  );
}
