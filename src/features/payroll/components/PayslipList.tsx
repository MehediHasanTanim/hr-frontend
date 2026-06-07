"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Download, Eye } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePayslips } from "@/features/payroll/api/payslips";
import type { Payslip } from "@/features/payroll/types";

export function PayslipList({
  employeeId,
  isHrView = false,
}: {
  employeeId?: string;
  isHrView?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const params: Record<string, string> = {};
  if (employeeId) params.employeeId = employeeId;
  if (search && isHrView) params.search = search;
  if (monthFilter) params.month = monthFilter;
  if (yearFilter) params.year = yearFilter;

  const { data: payslips = [], isLoading, error } = usePayslips(
    isHrView ? params : undefined,
  );

  return (
    <div className="space-y-4">
      {/* HR Filters */}
      {isHrView && (
        <div className="flex flex-wrap items-center gap-3">
          <Input
            className="h-7 w-48 text-xs"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            aria-label="Month"
            className="h-7 rounded-lg border border-input bg-background px-2 text-xs"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          >
            <option value="">All months</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={String(m)}>
                {format(new Date(2024, m - 1), "MMMM")}
              </option>
            ))}
          </select>
          <select
            aria-label="Year"
            className="h-7 rounded-lg border border-input bg-background px-2 text-xs"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="">All years</option>
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          Could not load payslips
        </div>
      ) : payslips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            No payslips available yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isHrView
              ? "Payslips will appear after payroll is disbursed."
              : "Payslips will appear here after your employer disburses payroll."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                {isHrView && (
                  <>
                    <th className="px-3 py-2">Employee</th>
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Department</th>
                  </>
                )}
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2">Net Pay</th>
                <th className="px-3 py-2">Generated</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payslips.map((ps) => (
                <tr key={ps.id} className="hover:bg-muted/20">
                  {isHrView && (
                    <>
                      <td className="px-3 py-3 font-medium">
                        {(ps as unknown as Record<string, string>).employeeName ??
                          "—"}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {(ps as unknown as Record<string, string>).employeeCode ??
                          "—"}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {(ps as unknown as Record<string, string>).department ??
                          "—"}
                      </td>
                    </>
                  )}
                  <td className="px-3 py-3 font-medium">
                    {format(new Date(ps.year, ps.month - 1), "MMMM yyyy")}
                  </td>
                  <td className="px-3 py-3">
                    {ps.netPayable.toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {formatDistanceToNow(new Date(ps.generatedAt), {
                      addSuffix: true,
                    })}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/payslips/${ps.id}`}>
                        <Button size="icon-sm" type="button" variant="ghost" aria-label="View">
                          <Eye className="size-4" />
                        </Button>
                      </Link>
                      {ps.downloadUrl && (
                        <a href={ps.downloadUrl} download target="_blank" rel="noreferrer">
                          <Button size="icon-sm" type="button" variant="ghost" aria-label="Download">
                            <Download className="size-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
