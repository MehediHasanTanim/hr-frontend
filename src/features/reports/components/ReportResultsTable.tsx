// src/features/reports/components/ReportResultsTable.tsx
// Sprint 6 — Dynamic report results table

"use client";

import React from "react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ReportKey } from "@/types/report.types";
import { BarChart3 } from "lucide-react";

interface ReportResultsTableProps {
  rows: Record<string, unknown>[];
  isLoading: boolean;
  reportKey: ReportKey | null;
  totalRows?: number;
}

const MONETARY_PATTERNS = /(pay|salary|gross|net|deduction|amount)/i;

function formatHeader(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCellValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number" && MONETARY_PATTERNS.test(key)) {
    return `৳ ${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (typeof value === "number") return value.toLocaleString("en-IN");
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return format(new Date(value), "dd MMM yyyy");
  }
  return String(value);
}

function isNumericColumn(key: string, rows: Record<string, unknown>[]): boolean {
  if (rows.length === 0) return false;
  const val = rows[0]?.[key];
  return typeof val === "number" || (typeof val === "string" && /^\d+(\.\d+)?$/.test(val));
}

export function ReportResultsTable({
  rows,
  isLoading,
  reportKey,
  totalRows = 0,
}: ReportResultsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2" data-testid="report-results-loading">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!reportKey) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center"
        data-testid="report-results-empty"
      >
        <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Run a report to see results</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center"
        data-testid="report-results-empty"
      >
        <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No data found for the selected filters.</p>
      </div>
    );
  }

  const columns = Object.keys(rows[0] ?? {});
  const numericCols = new Set(columns.filter((c) => isNumericColumn(c, rows)));

  return (
    <div data-testid="report-results-table">
      {totalRows > 500 && (
        <p className="mb-2 text-xs text-amber-600" role="status">
          Showing first 500 rows. Export for full data.
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className={cn(
                    "px-3 py-2 text-left font-medium text-muted-foreground",
                    numericCols.has(col) && "text-right",
                  )}
                >
                  {formatHeader(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t hover:bg-muted/30">
                {columns.map((col) => (
                  <td
                    key={col}
                    className={cn(
                      "px-3 py-2",
                      numericCols.has(col) && "text-right tabular-nums",
                    )}
                  >
                    {formatCellValue(col, row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
