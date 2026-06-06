"use client";

import { HolidayCalendarManager } from "@/features/holiday/components/HolidayCalendarManager";

export default function HolidaySettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Holiday Calendars</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage public holidays and calendars
        </p>
      </div>

      <HolidayCalendarManager />
    </div>
  );
}
