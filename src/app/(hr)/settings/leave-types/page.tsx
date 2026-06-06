"use client";

import { LeaveTypeList } from "@/features/leave/components/LeaveTypeList";

export default function LeaveTypesSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Leave Types</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure leave type policies
        </p>
      </div>

      <LeaveTypeList />
    </div>
  );
}
