// src/features/dashboard/hooks/useDashboardMetrics.ts
// Sprint 6 — Dashboard metric query hooks

"use client";

import { useQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { ReportResultDto } from "@/types/report.types";
import type { TeamLeaveResponse } from "@/types/mss.types";
import { useDashboardStore } from "../store/dashboard.store";

// ─── Headcount ──────────────────────────────────────────────────────────
export function useHeadcountMetric() {
  const { dateRange, fiscalYearStart } = useDashboardStore();

  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_METRIC('headcount', { startDate: fiscalYearStart, endDate: dateRange.endDate }),
    queryFn: () =>
      apiClient
        .get<ReportResultDto>('/api/v1/reports/preview', {
          params: { reportKey: 'headcount', startDate: fiscalYearStart, endDate: dateRange.endDate },
        })
        .then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Open Leaves ────────────────────────────────────────────────────────
export function useOpenLeavesMetric() {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_METRIC('open-leaves', { status: 'PENDING' }),
    queryFn: () =>
      apiClient
        .get<TeamLeaveResponse>('/api/v1/leave/requests/team', {
          params: { status: 'PENDING', limit: 1 },
        })
        .then((r) => r.data),
    staleTime: 60 * 1000,
  });
}

// ─── Payroll Status ─────────────────────────────────────────────────────
export function usePayrollStatusMetric(period: string) {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_METRIC('payroll', { period }),
    queryFn: () =>
      apiClient
        .get<ReportResultDto>('/api/v1/reports/preview', {
          params: { reportKey: 'payroll_summary', payrollPeriod: period },
        })
        .then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Recent Hires ───────────────────────────────────────────────────────
export function useRecentHiresMetric(days: number = 30) {
  const startDate = subDays(new Date(), days).toISOString().split('T')[0]!;
  const endDate = new Date().toISOString().split('T')[0]!;

  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_METRIC('recent-hires', { startDate, endDate }),
    queryFn: () =>
      apiClient
        .get<ReportResultDto>('/api/v1/reports/preview', {
          params: { reportKey: 'new_hires', startDate, endDate },
        })
        .then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Audit Log Activity Feed (HR_ADMIN only) ────────────────────────────
export function useActivityFeed() {
  return useQuery({
    queryKey: QUERY_KEYS.AUDIT_LOGS({ limit: 10, sort: 'createdAt:desc' }),
    queryFn: () =>
      apiClient
        .get('/api/v1/admin/audit-logs', {
          params: { limit: 10, sort: 'createdAt:desc' },
        })
        .then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  });
}
