// src/app/(dashboard)/reports/page.tsx
// Sprint 6 1.6.F2 — Reports page (HR_ADMIN only)

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ReportSelector } from "@/features/reports/components/ReportSelector";
import { ReportFilterPanel } from "@/features/reports/components/ReportFilterPanel";
import { ReportResultsTable } from "@/features/reports/components/ReportResultsTable";
import { ExportButton } from "@/features/reports/components/ExportButton";
import { SaveReportModal } from "@/features/reports/components/SaveReportModal";
import { SavedReportsSidebar } from "@/features/reports/components/SavedReportsSidebar";
import { useReportPreview } from "@/features/reports/hooks/useReportPreview";
import { useReportsStore } from "@/features/reports/store/reports.store";
import type { ReportKey } from "@/types/report.types";
import type { ReportFilters } from "@/features/reports/schemas/report-filter.schema";
import { Bookmark, ChevronDown, Plus } from "lucide-react";

// Stub departments — replace with real API call in production
const DEPARTMENTS = [
  { id: "dept-1", name: "Engineering" },
  { id: "dept-2", name: "HR" },
  { id: "dept-3", name: "Finance" },
];

export default function ReportsPage() {
  const {
    selectedReportKey,
    filters,
    hasRunOnce,
    setReportKey,
    setFilters,
    markRun,
  } = useReportsStore();

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);

  const previewParams = hasRunOnce
    ? { reportKey: selectedReportKey, ...filters }
    : null;
  const preview = useReportPreview(previewParams);

  function handleRun() {
    markRun();
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Generate and export HR reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSaveModalOpen(true)}
            data-testid="save-report-header-btn"
          >
            <Plus className="mr-2 h-4 w-4" />
            Save Report
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" data-testid="my-saved-reports-btn">
                <Bookmark className="mr-2 h-4 w-4" />
                My Saved Reports
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-2" align="end">
              <SavedReportsSidebar
                onSelectReport={(key, f) => {
                  setReportKey(key);
                  setFilters(f);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* ─── Body ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <ReportSelector selected={selectedReportKey} onChange={setReportKey} />

        <div className="space-y-4">
          <ReportFilterPanel
            reportKey={selectedReportKey}
            filters={filters}
            departments={DEPARTMENTS}
            onFiltersChange={setFilters}
            onRun={handleRun}
            isRunning={preview.isFetching}
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {preview.data ? `${preview.data.totalRows} rows found` : "No results yet"}
            </p>
            <div className="flex gap-2">
              <ExportButton
                savedReportId={savedReportId}
                format="xlsx"
                onJobQueued={() => {}}
              />
              <ExportButton
                savedReportId={savedReportId}
                format="pdf"
                onJobQueued={() => {}}
              />
            </div>
          </div>

          <ReportResultsTable
            rows={preview.data?.rows ?? []}
            isLoading={preview.isFetching}
            reportKey={hasRunOnce ? selectedReportKey : null}
            totalRows={preview.data?.totalRows}
          />
        </div>
      </div>

      <SaveReportModal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        reportKey={selectedReportKey}
        filters={filters}
      />
    </div>
  );
}
