// src/app/(dashboard)/leave/calendar/page.tsx
import React from "react";
import { TeamLeaveCalendar } from "@/features/leave/components/TeamLeaveCalendar";

export default function LeaveCalendarPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Team Leave Calendar</h1>
      <TeamLeaveCalendar />
    </div>
  );
}
