// src/features/dashboard/store/dashboard.store.ts
// Sprint 6 — Dashboard UI state (Zustand): date range and active filters only

"use client";

import { create } from "zustand";

export interface DateRange {
  startDate: string;
  endDate: string;
  preset: 'this_month' | 'last_month' | 'this_quarter' | 'this_year' | 'custom';
}

function getThisMonth(): DateRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
    preset: 'this_month',
  };
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]!;
}

function getFiscalYearStart(): string {
  const now = new Date();
  const year = now.getMonth() < 6 ? now.getFullYear() - 1 : now.getFullYear();
  return `${year}-07-01`;
}

interface DashboardState {
  dateRange: DateRange;
  fiscalYearStart: string;
  setDateRange: (range: DateRange) => void;
  setPreset: (preset: DateRange['preset']) => void;
}

const presets: Record<string, () => DateRange> = {
  this_month: getThisMonth,
  last_month: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { startDate: formatDate(start), endDate: formatDate(end), preset: 'last_month' };
  },
  this_quarter: () => {
    const now = new Date();
    const quarterStart = Math.floor(now.getMonth() / 3) * 3;
    const start = new Date(now.getFullYear(), quarterStart, 1);
    const end = now;
    return { startDate: formatDate(start), endDate: formatDate(end), preset: 'this_quarter' };
  },
  this_year: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    return { startDate: formatDate(start), endDate: formatDate(end), preset: 'this_year' };
  },
  custom: getThisMonth,
};

export const useDashboardStore = create<DashboardState>((set) => ({
  dateRange: getThisMonth(),
  fiscalYearStart: getFiscalYearStart(),
  setDateRange: (range) => set({ dateRange: range }),
  setPreset: (preset) => {
    const range = (presets[preset] ?? getThisMonth)();
    set({ dateRange: { ...range, preset } });
  },
}));
