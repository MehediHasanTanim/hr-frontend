"use client";

import { TeamLeaveCalendar } from "@/features/leave/components/TeamLeaveCalendar";

export default function LeaveCalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Leave Calendar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View team leave at a glance
        </p>
      </div>

      <TeamLeaveCalendar />
    </div>
  );
}
