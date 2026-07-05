// src/features/reports/components/SavedReportsSidebar.tsx
// Sprint 6 — Saved reports sidebar (loads saved params into filter panel)

"use client";

import React from "react";
import { Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSavedReports, useDeleteReport } from "../hooks/useSavedReports";
import type { ReportKey } from "@/types/report.types";
import type { ReportFilters } from "../schemas/report-filter.schema";

interface SavedReportsSidebarProps {
  onSelectReport: (reportKey: ReportKey, filters: ReportFilters) => void;
}

export function SavedReportsSidebar({ onSelectReport }: SavedReportsSidebarProps) {
  const { data: reports, isLoading } = useSavedReports();
  const deleteReport = useDeleteReport();

  if (isLoading) {
    return (
      <div className="space-y-2 p-2" data-testid="saved-reports-loading">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground" data-testid="saved-reports-empty">
        No saved reports yet.
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2" data-testid="saved-reports-list">
      {reports.map((report) => (
        <div
          key={report.id}
          className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-accent"
        >
          <button
            type="button"
            onClick={() =>
              onSelectReport(
                report.reportKey,
                (report.parameters as ReportFilters) ?? {},
              )
            }
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
            data-testid={`saved-report-${report.id}`}
          >
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-medium">{report.name}</span>
            <Badge variant="outline" className="ml-auto shrink-0">
              {report.reportKey}
            </Badge>
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-red-500"
            onClick={() => deleteReport.mutate(report.id)}
            aria-label={`Delete ${report.name}`}
            data-testid={`delete-report-${report.id}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}
