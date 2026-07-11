// src/app/(dashboard)/attendance/exceptions/page.tsx
import React from "react";

export default function AttendanceExceptionsPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Attendance Exceptions</h1>
      <div className="py-8 text-center text-sm text-muted-foreground">
        Exceptions report renders with late arrivals, absences, and missing punch data.
      </div>
    </div>
  );
}
