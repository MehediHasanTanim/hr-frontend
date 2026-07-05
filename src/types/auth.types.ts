// src/types/auth.types.ts
// Sprint 6 — Extended auth types (merge with existing api.ts types)

export type Role = 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN';

export interface LeaveBalanceSummary {
  leaveType: string;
  entitled: number;
  taken: number;
  remaining: number;
}

export interface MeResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId: string;
  departmentName: string;
  jobTitle: string;
  leaveBalances: LeaveBalanceSummary[];
  pendingTaskCount: number;
  unreadNotificationCount: number;
}
