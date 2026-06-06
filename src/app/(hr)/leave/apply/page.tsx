"use client";

import { LeaveBalanceWidget } from "@/features/leave/components/LeaveBalanceWidget";
import { LeaveRequestForm } from "@/features/leave/components/LeaveRequestForm";

export default function LeaveApplyPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Apply for Leave</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit a new leave request
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Your Leave Balances
        </h2>
        <LeaveBalanceWidget />
      </section>

      <section>
        <LeaveRequestForm />
      </section>
    </div>
  );
}
