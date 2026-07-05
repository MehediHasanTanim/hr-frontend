// src/features/mss/schemas/approval.schema.ts
// Sprint 6 — Approval/rejection form validation schemas

import { z } from "zod";

export const approvalRemarksSchema = z.object({
  remarks: z.string().max(500).optional(),
});

export const rejectionSchema = z.object({
  reason: z.string().min(1, "Rejection reason is required").max(500),
});

export type ApprovalRemarks = z.infer<typeof approvalRemarksSchema>;
export type RejectionForm = z.infer<typeof rejectionSchema>;
