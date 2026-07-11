// src/app/(dashboard)/attendance/dashboard/page.tsx
import React from "react";
import { AttendanceDashboard } from "@/features/attendance/components/AttendanceDashboard";

export default function AttendanceDashboardPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Attendance Dashboard</h1>
      <AttendanceDashboard />
    </div>
  );
}
