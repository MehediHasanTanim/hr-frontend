// src/features/reports/api/reports.api.ts
// Sprint 6 — Reports API module

import { apiClient } from "@/lib/api-client";
import type {
  ReportQueryParams,
  ReportResultDto,
  SavedReportDto,
  SaveReportDto,
  ExportJobAcceptedDto,
  ExportFormat,
} from "@/types/report.types";

export const reportsApi = {
  preview: (params: ReportQueryParams): Promise<ReportResultDto> =>
    apiClient.get("/api/v1/reports/preview", { params }).then((r) => r.data),

  listSaved: (): Promise<SavedReportDto[]> =>
    apiClient.get("/api/v1/reports/saved").then((r) => r.data),

  saveReport: (dto: SaveReportDto): Promise<SavedReportDto> =>
    apiClient.post("/api/v1/reports/saved", dto).then((r) => r.data),

  deleteReport: (id: string): Promise<void> =>
    apiClient.delete(`/api/v1/reports/saved/${id}`).then((r) => r.data),

  triggerExport: (id: string, format: ExportFormat): Promise<ExportJobAcceptedDto> =>
    apiClient.post(`/api/v1/reports/saved/${id}/export`, { format }).then((r) => r.data),
};
