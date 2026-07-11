// src/app/(dashboard)/holiday/page.tsx
import React from "react";
import { HolidayCalendarManager } from "@/features/holiday/components/HolidayCalendarManager";

export default function HolidayManagementPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Holiday Calendar</h1>
      <HolidayCalendarManager />
    </div>
  );
}
