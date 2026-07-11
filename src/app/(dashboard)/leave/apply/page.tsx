// src/app/(dashboard)/leave/apply/page.tsx
// Sprint 3 F1 — Leave Application Form

import React from "react";
import { LeaveRequestForm } from "@/features/leave/components/LeaveRequestForm";

export default function LeaveApplyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Apply for Leave</h1>
      <LeaveRequestForm />
    </div>
  );
}
