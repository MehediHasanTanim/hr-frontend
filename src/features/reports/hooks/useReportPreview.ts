// src/features/reports/hooks/useReportPreview.ts
// Sprint 6 — Report preview query hook

"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { reportsApi } from "../api/reports.api";
import type { ReportQueryParams } from "@/types/report.types";

export function useReportPreview(params: ReportQueryParams | null) {
  return useQuery({
    queryKey: params
      ? QUERY_KEYS.REPORT_PREVIEW(params.reportKey, params)
      : ["report-idle"],
    queryFn: () => reportsApi.preview(params!),
    enabled: params !== null,
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
