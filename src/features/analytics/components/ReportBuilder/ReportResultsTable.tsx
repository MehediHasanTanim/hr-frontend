// src/features/analytics/components/ReportBuilder/ReportResultsTable.tsx
"use client";
import React from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import type { ReportRunResult } from "@/features/analytics/types/analytics";

interface Props {
  result: ReportRunResult | null;
  isLoading: boolean;
  isError: boolean;
  hasNotRun: boolean;
}

export function ReportResultsTable({ result, isLoading, isError, hasNotRun }: Props) {
  if (hasNotRun && !isLoading && !isError && !result) {
    return (
      <div data-testid="report-not-run" className="flex h-40 items-center justify-center rounded-lg border text-sm text-muted-foreground">
        Configure your report and click &ldquo;Run&rdquo; to see results.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div data-testid="report-loading" className="flex h-40 items-center justify-center rounded-lg border">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div data-testid="report-error" className="flex h-40 items-center justify-center rounded-lg border text-sm text-destructive">
        Failed to run report.
      </div>
    );
  }

  if (!result) return null;

  if (result.columns.length === 0 && result.rows.length === 0) {
    return (
      <div data-testid="report-empty" className="flex h-40 items-center justify-center rounded-lg border text-sm text-muted-foreground">
        No results found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div data-testid="report-results">
      {result.truncated && (
        <div className="mb-3 flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Showing first {result.rowCount.toLocaleString()} rows — refine filters to see more.
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {result.columns.map((col) => (
                <th key={col} className="px-3 py-2 text-left font-medium">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, ri) => (
              <tr key={ri} className="border-t hover:bg-muted/30">
                {result.columns.map((col) => (
                  <td key={col} className="px-3 py-1.5">
                    {row[col] !== null && row[col] !== undefined ? String(row[col]) : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {result.rowCount.toLocaleString()} row{result.rowCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
