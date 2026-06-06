"use client";

import { LeaveBalanceWidget } from "@/features/leave/components/LeaveBalanceWidget";

export default function LeaveDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Leave Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your leave summary at a glance
        </p>
      </div>

      <section>
        <LeaveBalanceWidget />
      </section>
    </div>
  );
}
