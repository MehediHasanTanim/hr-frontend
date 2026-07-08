// src/features/analytics/schemas/analytics.schema.ts
// Sprint 11 — Analytics Zod Schemas (mirrors backend DTOs exactly)

import { z } from "zod";

const reportFilterSchema = z.object({
  field: z.string(),
  operator: z.enum([
    "EQ", "NEQ", "GT", "GTE", "LT", "LTE", "IN", "BETWEEN", "LIKE",
  ]),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.union([z.string(), z.number()])),
  ]),
});

const reportDefinitionSchema = z.object({
  fields: z.array(z.string()).min(1, "Select at least one field"),
  filters: z.array(reportFilterSchema),
  columns: z.array(z.string()),
  groupBy: z.array(z.string()).optional(),
  sort: z
    .array(
      z.object({
        field: z.string(),
        direction: z.enum(["ASC", "DESC"]),
      }),
    )
    .optional(),
  limit: z.number().int().positive().max(5000).optional(),
});

export const createSavedReportSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  entityType: z.enum([
    "EMPLOYEE", "PAYROLL", "LEAVE", "ATTENDANCE", "ATTRITION_RISK",
  ]),
  definition: reportDefinitionSchema,
  isShared: z.boolean().optional(),
});

export type CreateSavedReportFormValues = z.infer<typeof createSavedReportSchema>;
