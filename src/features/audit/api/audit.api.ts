import { apiClient } from "@/lib/api-client";
import type {
  AuditLogListResponse,
  AuditLogFilters,
  ExportAuditLogResponse,
} from "../types/audit.types";

export async function listAuditLogs(
  filters: AuditLogFilters,
): Promise<AuditLogListResponse> {
  const response = await apiClient.get<AuditLogListResponse>(
    "/api/v1/compliance/audit-logs",
    { params: filters },
  );
  return response.data;
}

export async function exportAuditLogs(
  filters: Omit<AuditLogFilters, "page" | "limit">,
): Promise<ExportAuditLogResponse> {
  const response = await apiClient.post<ExportAuditLogResponse>(
    "/api/v1/compliance/audit-logs/export",
    filters,
  );
  return response.data;
}
