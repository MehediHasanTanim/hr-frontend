// src/types/report.types.ts
// Sprint 6 — Report types

export type ReportKey =
  | 'headcount'
  | 'attrition'
  | 'payroll_summary'
  | 'leave_utilization'
  | 'attendance_summary'
  | 'new_hires'
  | 'exits';

export type ExportFormat = 'xlsx' | 'pdf';

export interface ReportQueryParams {
  reportKey: ReportKey;
  startDate: string;
  endDate: string;
  departmentId?: string;
  leaveType?: string;
  payrollPeriod?: string;
}

export interface ReportResultDto {
  reportKey: ReportKey;
  generatedAt: string;
  rows: Record<string, unknown>[];
  totalRows: number;
}

export interface SavedReportDto {
  id: string;
  name: string;
  reportKey: ReportKey;
  parameters: Record<string, unknown>;
  description?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveReportDto {
  name: string;
  reportKey: ReportKey;
  parameters: Record<string, unknown>;
  description?: string;
}

export interface ExportJobAcceptedDto {
  jobId: string;
  message: string;
}
