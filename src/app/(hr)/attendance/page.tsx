"use client";

import { AttendanceDashboard } from "@/features/attendance/components/AttendanceDashboard";

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Daily attendance and exception reports
        </p>
      </div>

      <AttendanceDashboard />
    </div>
  );
}
