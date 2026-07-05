// src/types/settings.types.ts
// Sprint 6 — Settings types

import type { Role } from './auth.types';

export interface Permission {
  key: string;
  displayName: string;
  category: string;
  description?: string;
  isCore: boolean; // core permissions cannot be removed from HR_ADMIN
}

export interface RolePermissionMatrix {
  permissions: Permission[];
  matrix: Record<Role, string[]>; // role → array of permission keys
}

export interface NotificationTemplate {
  id: string;
  eventKey: string;
  displayName: string;
  channel: 'email' | 'sms' | 'in_app';
  subject?: string;
  body: string;
  availableVariables: string[];
  updatedAt?: string;
}

export const AVAILABLE_VARIABLES: Record<string, string[]> = {
  LEAVE_APPROVED: ['employeeName', 'leaveType', 'startDate', 'endDate', 'days'],
  LEAVE_REJECTED: ['employeeName', 'leaveType', 'startDate', 'endDate', 'rejectionReason'],
  PAYSLIP_READY: ['employeeName', 'period', 'netPay'],
  POLICY_ACKNOWLEDGEMENT_DUE: ['employeeName', 'policyName', 'dueDate'],
};
