// src/app/(dashboard)/compensation/statement/page.tsx
// Sprint 10 F2 — Total Compensation Statement Page

"use client";

import React from "react";
import { CompStatementBreakdown } from "@/features/compensation/components/CompStatementBreakdown";
import { CompStatementDownloadButton } from "@/features/compensation/components/CompStatementDownloadButton";

export default function CompensationStatementPage() {
  // In production, derive employeeId from auth context or route param
  const employeeId = "current";

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Total Compensation Statement</h1>
        <CompStatementDownloadButton employeeId={employeeId} />
      </div>
      <CompStatementBreakdown employeeId={employeeId} />
    </div>
  );
}
