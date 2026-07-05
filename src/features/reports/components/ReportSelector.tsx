// src/features/reports/components/ReportSelector.tsx
// Sprint 6 — Report type selector (7 radio-style cards)

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { ReportKey } from "@/types/report.types";

interface ReportConfig {
  key: ReportKey;
  label: string;
  description: string;
}

const REPORTS: ReportConfig[] = [
  { key: "headcount", label: "Headcount", description: "Active employees by department" },
  { key: "attrition", label: "Attrition", description: "Attrition rate & turnover analysis" },
  { key: "payroll_summary", label: "Payroll Summary", description: "Gross, net & deductions by department" },
  { key: "leave_utilization", label: "Leave Utilization", description: "Leave usage vs entitlement" },
  { key: "attendance_summary", label: "Attendance", description: "Present, absent, late & WFH counts" },
  { key: "new_hires", label: "New Hires", description: "Employees joined in date range" },
  { key: "exits", label: "Exits", description: "Employees exited in date range" },
];

interface ReportSelectorProps {
  selected: ReportKey;
  onChange: (key: ReportKey) => void;
}

export function ReportSelector({ selected, onChange }: ReportSelectorProps) {
  return (
    <div className="space-y-2" data-testid="report-selector">
      <h3 className="text-sm font-semibold text-muted-foreground">Report Type</h3>
      <div className="space-y-1">
        {REPORTS.map(({ key, label, description }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            data-testid={`report-option-${key}`}
            className={cn(
              "w-full rounded-lg border px-3 py-2 text-left transition-colors",
              selected === key
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:bg-accent",
            )}
          >
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
