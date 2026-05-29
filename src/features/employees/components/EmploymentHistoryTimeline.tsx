"use client";

import { BriefcaseBusiness, CircleDot, GitBranch, UserCheck, UserX } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { EmploymentHistoryRecord } from "@/features/employees/types/employee.types";

const icons = {
  hired: UserCheck,
  promoted: BriefcaseBusiness,
  transferred: GitBranch,
  terminated: UserX,
};

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function EmploymentHistoryTimeline({ records }: { records?: EmploymentHistoryRecord[] | undefined }) {
  const sorted = [...(records ?? [])].sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));

  if (sorted.length === 0) {
    return <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No employment history yet.</div>;
  }

  return (
    <ol className="space-y-4">
      {sorted.map((record) => {
        const Icon = icons[record.eventType] ?? CircleDot;
        return (
          <li key={record.id} className="grid grid-cols-[32px_1fr] gap-3">
            <div className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="size-4" /></div>
            <div className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="outline">{label(record.eventType)}</Badge>
                <time className="text-sm text-muted-foreground">{record.effectiveDate}</time>
              </div>
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                <p><span className="text-muted-foreground">Old value:</span> {record.oldValue || "-"}</p>
                <p><span className="text-muted-foreground">New value:</span> {record.newValue || "-"}</p>
                <p><span className="text-muted-foreground">Changed by:</span> {record.changedBy || "-"}</p>
                <p><span className="text-muted-foreground">Remarks:</span> {record.remarks || "-"}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
