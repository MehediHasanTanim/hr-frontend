// src/features/analytics/types/analytics.ts
// Sprint 11 — Analytics Types (mirrors backend DTOs)

export type ReportEntityType =
  | "EMPLOYEE"
  | "PAYROLL"
  | "LEAVE"
  | "ATTENDANCE"
  | "ATTRITION_RISK";

export type ReportFilterOperator =
  | "EQ"
  | "NEQ"
  | "GT"
  | "GTE"
  | "LT"
  | "LTE"
  | "IN"
  | "BETWEEN"
  | "LIKE";

export interface ReportFilter {
  field: string;
  operator: ReportFilterOperator;
  value: string | number | boolean | (string | number)[];
}

export interface ReportDefinition {
  fields: string[];
  filters: ReportFilter[];
  columns: string[];
  groupBy?: string[];
  sort?: { field: string; direction: "ASC" | "DESC" }[];
  limit?: number;
}

export interface SavedReport {
  id: string;
  name: string;
  description?: string;
  entityType: ReportEntityType;
  definition: ReportDefinition;
  createdById: string;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportRun {
  id: string;
  savedReportId: string;
  executedById: string;
  rowCount: number;
  executionMs: number;
  status: "SUCCESS" | "FAILED" | "REJECTED_UNSAFE_QUERY";
  failureReason?: string;
  createdAt: string;
}

export interface ReportRunResult {
  columns: string[];
  rows: Record<string, string | number | boolean | null>[];
  rowCount: number;
  truncated: boolean;
}

export type RiskBand = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AttritionSignalBreakdown {
  tenureMonths: number;
  tenureSignal: number;
  lastReviewRating: number | null;
  reviewSignal: number;
  absenceCountLast90d: number;
  absenceSignal: number;
  totalScore: number;
}

export interface AttritionRiskScore {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  riskScore: number;
  riskBand: RiskBand;
  signals: AttritionSignalBreakdown;
  computedAt: string;
}

// Dashboard DTOs
export interface WorkforceDemographics {
  totalEmployees: number;
  newHiresMtd: number;
  exitsMtd: number;
  avgTenureMonths: number;
  departmentBreakdown: { department: string; count: number }[];
  employmentTypeBreakdown: { type: string; count: number }[];
  locationBreakdown: { location: string; count: number }[];
}

export interface PayrollTrend {
  month: string;
  grossPayroll: number;
  netPayroll: number;
}

export interface LeaveLiability {
  totalAccruedDays: number;
  breakdown: { leaveType: string; days: number }[];
}

export interface CreateSavedReportDto {
  name: string;
  description?: string;
  entityType: ReportEntityType;
  definition: ReportDefinition;
  isShared?: boolean;
}
