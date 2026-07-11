// src/app/(dashboard)/leave/requests/page.tsx
// Sprint 3 — Leave Requests & Balance

import React from "react";
import { LeaveBalanceWidget } from "@/features/leave/components/LeaveBalanceWidget";
import { LeaveRequestForm } from "@/features/leave/components/LeaveRequestForm";

export default function LeaveRequestsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">My Leave</h1>
      <LeaveBalanceWidget />
    </div>
  );
}
