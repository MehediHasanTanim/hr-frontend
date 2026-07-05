// src/features/reports/schemas/report-filter.schema.ts
// Sprint 6 — Report filter validation schema

import { z } from "zod";

export const reportFilterSchema = z
  .object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    departmentId: z.string().uuid().optional(),
    leaveType: z.string().optional(),
    payrollPeriod: z.string().optional(),
  })
  .refine((d) => new Date(d.startDate) <= new Date(d.endDate), {
    message: "Start date must be before or equal to end date",
    path: ["startDate"],
  });

export type ReportFilters = z.infer<typeof reportFilterSchema>;
