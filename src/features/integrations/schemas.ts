// src/features/integrations/schemas.ts
// Sprint 12 — Shared Zod schemas for integrations module

import { z } from "zod";

// ─── API Keys ──────────────────────────────────────────────────
export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.enum([
    "employees:read", "employees:write",
    "payroll:read", "payroll:write",
    "leave:read", "leave:write",
    "reports:read", "reports:write",
    "webhooks:read", "webhooks:write",
  ] as const)).min(1, "Select at least one scope"),
  expiresAt: z.string().datetime().optional(),
});

// ─── Webhooks ─────────────────────────────────────────────────
export const registerWebhookSchema = z.object({
  url: z.string().url().refine((v) => v.startsWith("https://"), "Must be an HTTPS URL"),
  subscribedEvents: z.array(z.enum([
    "employee.created", "employee.updated", "employee.terminated",
    "leave.approval_requested", "leave.approved", "leave.rejected",
    "payroll.cycle_completed", "payroll.payslip_generated",
    "review.completed",
  ] as const)).min(1, "Select at least one event"),
});

// ─── Slack ────────────────────────────────────────────────────
export const channelMappingSchema = z.object({
  mappings: z.array(z.object({
    eventType: z.enum(["leave.approval_requested", "review.approval_requested"]),
    channelId: z.string().min(1),
    channelName: z.string().min(1),
  })),
});

export type CreateApiKeyForm = z.infer<typeof createApiKeySchema>;
export type RegisterWebhookForm = z.infer<typeof registerWebhookSchema>;
export type ChannelMappingForm = z.infer<typeof channelMappingSchema>;
