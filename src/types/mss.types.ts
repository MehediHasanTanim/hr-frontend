// src/types/mss.types.ts
// Sprint 6 — Manager Self-Service types

export interface TeamLeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  departmentName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reason?: string;
  appliedAt: string;
}

export interface TeamLeaveFilters {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface TeamLeaveResponse {
  data: TeamLeaveRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface EmployeeSummary {
  employeeId: string;
  employeeName: string;
  jobTitle: string;
  departmentName: string;
  leaveBalances: LeaveBalanceSummary[];
  lastPayrollNetPay: number | null;
  attendanceSummary: AttendanceSummary;
  pendingLeaveRequests: number;
}

export interface LeaveBalanceSummary {
  leaveType: string;
  entitled: number;
  taken: number;
  remaining: number;
}

export interface AttendanceSummary {
  presentDays: number;
  absentDays: number;
  lateDays: number;
  wfhDays?: number;
  currentMonthPeriod: string;
}
