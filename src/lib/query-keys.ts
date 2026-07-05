// src/lib/query-keys.ts
// Sprint 6 — React Query cache key registry
// Pattern: each domain exports its own keys object, all collected here.

export const QUERY_KEYS = {
  // ─── Auth & Me ────────────────────────────────────────────────
  ME: ['me'] as const,

  // ─── Reports ───────────────────────────────────────────────────
  REPORT_PREVIEW: (reportKey: string, params: Record<string, unknown>) =>
    ['report', 'preview', reportKey, params] as const,

  SAVED_REPORTS: ['report', 'saved'] as const,

  // ─── Manager Self-Service (MSS) ───────────────────────────────
  TEAM_LEAVE_REQUESTS: (filters?: Record<string, unknown>) =>
    filters ? ['leave', 'team', filters] : ['leave', 'team'],

  EMPLOYEE_SUMMARY: (employeeId: string) =>
    ['employee', 'summary', employeeId] as const,

  // ─── Settings ──────────────────────────────────────────────────
  ROLES_MATRIX: ['settings', 'roles'] as const,

  NOTIFICATION_TEMPLATES: ['settings', 'notification-templates'] as const,

  // ─── Payslips ──────────────────────────────────────────────────
  PAYSLIPS: (filters?: Record<string, unknown>) =>
    filters ? ['payslips', filters] : ['payslips'],

  // ─── Audit Logs ────────────────────────────────────────────────
  AUDIT_LOGS: (filters?: Record<string, unknown>) =>
    filters ? ['audit-logs', filters] : ['audit-logs'],

  // ─── Dashboard ─────────────────────────────────────────────────
  DASHBOARD_METRIC: (metric: string, params: Record<string, unknown>) =>
    ['dashboard', metric, params] as const,

  // ─── Leave ─────────────────────────────────────────────────────
  LEAVE_REQUESTS: (filters?: Record<string, unknown>) =>
    filters ? ['leave', 'requests', filters] : ['leave', 'requests'],

  LEAVE_CALENDAR: (params: Record<string, unknown>) =>
    ['leave', 'calendar', params] as const,

  // ─── Documents ─────────────────────────────────────────────────
  MY_DOCUMENTS: (filters?: Record<string, unknown>) =>
    filters ? ['documents', 'me', filters] : ['documents', 'me'],

  // ─── Tasks / Acknowledgements ─────────────────────────────────
  PENDING_TASKS: (filters?: Record<string, unknown>) =>
    filters ? ['tasks', 'pending', filters] : ['tasks', 'pending'],
};
