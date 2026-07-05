// src/features/reports/store/reports.store.ts
// Sprint 6 — Reports UI state (Zustand)

"use client";

import { create } from "zustand";
import type { ReportKey } from "@/types/report.types";
import type { ReportFilters } from "../schemas/report-filter.schema";

const DEFAULT_FILTERS: ReportFilters = {
  startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]!,
  endDate: new Date().toISOString().split("T")[0]!,
};

interface ReportsState {
  selectedReportKey: ReportKey;
  filters: ReportFilters;
  hasRunOnce: boolean;
  setReportKey: (key: ReportKey) => void;
  setFilters: (f: Partial<ReportFilters>) => void;
  resetFilters: () => void;
  markRun: () => void;
}

export const useReportsStore = create<ReportsState>((set) => ({
  selectedReportKey: "headcount",
  filters: { ...DEFAULT_FILTERS },
  hasRunOnce: false,
  setReportKey: (key) =>
    set({ selectedReportKey: key, filters: { ...DEFAULT_FILTERS }, hasRunOnce: false }),
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),
  markRun: () => set({ hasRunOnce: true }),
}));
