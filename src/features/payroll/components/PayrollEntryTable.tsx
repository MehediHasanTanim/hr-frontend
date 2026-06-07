"use client";

import { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useEntryComponents,
  usePayrollEntries,
} from "@/features/payroll/api/payroll-cycles";
import { EntryStatusBadge } from "@/features/payroll/components/EntryStatusBadge";
import type { PayrollEntry, PayrollEntryComponent } from "@/features/payroll/types";
import { cn } from "@/lib/utils";

function fmt(amount: number) {
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

function EntryDetail({ entryId }: { entryId: string }) {
  const { data: components = [], isLoading } = useEntryComponents(entryId);

  if (isLoading) return <Skeleton className="h-20 w-full" />;

  const earnings = components.filter((c) => c.type === "earning");
  const deductions = components.filter((c) => c.type === "deduction");

  const grossTotal = earnings.reduce((s, c) => s + c.amount, 0);
  const dedTotal = deductions.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="grid grid-cols-2 gap-4 p-3">
      {earnings.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold text-green-700">Earnings</p>
          <table className="w-full text-xs">
            <tbody>
              {earnings.map((c) => (
                <tr key={c.componentId}>
                  <td className="py-0.5 text-muted-foreground">{c.componentName}</td>
                  <td className="py-0.5 text-right">{fmt(c.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {deductions.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold text-red-700">Deductions</p>
          <table className="w-full text-xs">
            <tbody>
              {deductions.map((c) => (
                <tr key={c.componentId}>
                  <td className="py-0.5 text-muted-foreground">{c.componentName}</td>
                  <td className="py-0.5 text-right">{fmt(c.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="col-span-2 border-t pt-1 text-xs font-medium">
        <div className="flex justify-between">
          <span>Gross: {fmt(grossTotal)}</span>
          <span>Deductions: {fmt(dedTotal)}</span>
          <span>Net: {fmt(grossTotal - dedTotal)}</span>
        </div>
      </div>
    </div>
  );
}

export function PayrollEntryTable({ cycleId }: { cycleId: string }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: entries = [], isLoading, error } = usePayrollEntries(cycleId);

  const filtered = entries.filter((e) => {
    if (
      search &&
      !e.employeeName.toLowerCase().includes(search.toLowerCase()) &&
      !e.employeeCode.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    return true;
  });

  const statusFilters = [
    "all",
    "computed",
    "held",
    "approved",
    "disbursed",
  ];

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        Could not load entries
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-7 w-48 pl-7 text-xs"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1 rounded-lg border p-0.5">
            {statusFilters.map((s) => (
              <button
                key={s}
                type="button"
                className={cn(
                  "rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
                  statusFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setStatusFilter(s)}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Dept</th>
                <th className="px-3 py-2">Working Days</th>
                <th className="px-3 py-2">Present</th>
                <th className="px-3 py-2">LOP</th>
                <th className="px-3 py-2">Gross</th>
                <th className="px-3 py-2">Deductions</th>
                <th className="px-3 py-2">Net</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-3 py-3" colSpan={10}>
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-3 py-8 text-center text-muted-foreground" colSpan={10}>
                    No entries found
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tbody key={entry.id}>
                    <tr className="hover:bg-muted/20">
                      <td className="px-3 py-3">
                        <p className="font-medium">{entry.employeeName}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.employeeCode}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {entry.department}
                      </td>
                      <td className="px-3 py-3">{entry.workingDays}</td>
                      <td className="px-3 py-3">{entry.presentDays}</td>
                      <td className="px-3 py-3">
                        {entry.lopDays > 0 ? (
                          <span className="text-amber-600">{entry.lopDays}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-3">{fmt(entry.grossEarnings)}</td>
                      <td className="px-3 py-3">{fmt(entry.totalDeductions)}</td>
                      <td className="px-3 py-3 font-medium">
                        {fmt(entry.netPayable)}
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1">
                          <EntryStatusBadge status={entry.status} />
                          {entry.status === "held" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertCircle className="size-3.5 text-amber-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                No approved salary for this period. Employee was
                                excluded from this run.
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          onClick={() =>
                            setExpandedId(
                              expandedId === entry.id ? null : entry.id,
                            )
                          }
                        >
                          {expandedId === entry.id ? (
                            <ChevronUp className="size-3" />
                          ) : (
                            <ChevronDown className="size-3" />
                          )}
                          Details
                        </button>
                      </td>
                    </tr>
                    {expandedId === entry.id && (
                      <tr>
                        <td className="bg-muted/20 p-0" colSpan={10}>
                          <EntryDetail entryId={entry.id} />
                        </td>
                      </tr>
                    )}
                  </tbody>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  );
}
