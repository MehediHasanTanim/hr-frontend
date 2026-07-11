// src/features/integrations/webhooks/types.ts
// Sprint 12 — Webhook Types

export type WebhookEventType =
  | "employee.created" | "employee.updated" | "employee.terminated"
  | "leave.approval_requested" | "leave.approved" | "leave.rejected"
  | "payroll.cycle_completed" | "payroll.payslip_generated"
  | "review.completed";

export type WebhookStatus = "ACTIVE" | "INACTIVE";

export type DeliveryStatus = "PENDING" | "SUCCESS" | "FAILED" | "EXHAUSTED";

export interface Webhook {
  id: string;
  url: string;
  subscribedEvents: WebhookEventType[];
  status: WebhookStatus;
  secretPrefix: string;
  failedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventType: WebhookEventType;
  status: DeliveryStatus;
  attemptCount: number;
  lastAttemptAt: string | null;
  responseCode: number | null;
  responseBody: string | null;
  nextRetryAt: string | null;
  createdAt: string;
}

export interface RegisterWebhookDto {
  url: string;
  subscribedEvents: WebhookEventType[];
}

export interface WebhookCreatedResponse {
  id: string;
  url: string;
  subscribedEvents: WebhookEventType[];
  rawSecret: string;
  secretPrefix: string;
}

export interface TestPingResult {
  statusCode: number;
  latencyMs: number;
  success: boolean;
}
