// src/features/offboarding/schemas/offboarding.schema.ts
// Sprint 11 — Offboarding Zod Schemas (mirrors backend DTOs exactly)

import { z } from "zod";

export const createExitRequestSchema = z.object({
  employeeId: z.string().uuid(),
  reasonType: z.enum([
    "RESIGNATION", "TERMINATION", "RETIREMENT", "END_OF_CONTRACT",
  ]),
  reasonNotes: z.string().optional(),
  requestedLastWorkingDay: z.string().refine(
    (d) => new Date(d) >= new Date(new Date().toDateString()),
    "Last working day must be today or later",
  ),
});

export const rejectExitRequestSchema = z.object({
  rejectionReason: z.string().min(1, "Rejection reason is required"),
});

export const completeChecklistTaskSchema = z.object({
  notes: z.string().optional(),
});

export const skipChecklistTaskSchema = z.object({
  notes: z.string().min(1, "A reason is required to skip a task"),
});

export const recordExitInterviewSchema = z.object({
  scheduledAt: z.string().optional(),
  responses: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .optional(),
  overallSentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]).optional(),
});

export type CreateExitRequestFormValues = z.infer<typeof createExitRequestSchema>;
export type RejectExitRequestFormValues = z.infer<typeof rejectExitRequestSchema>;
export type CompleteChecklistTaskFormValues = z.infer<typeof completeChecklistTaskSchema>;
export type SkipChecklistTaskFormValues = z.infer<typeof skipChecklistTaskSchema>;
export type RecordExitInterviewFormValues = z.infer<typeof recordExitInterviewSchema>;
