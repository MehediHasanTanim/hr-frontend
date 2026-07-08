// src/features/benefits/schemas/enrollment.schema.ts
// Sprint 10 — Benefits Enrollment Zod Schemas

import { z } from "zod";

export const dependentSchema = z.object({
  fullName: z.string().min(1).max(255),
  relationship: z.enum(["SPOUSE", "CHILD", "DOMESTIC_PARTNER", "OTHER"]),
  dateOfBirth: z.string().refine((d) => new Date(d) < new Date(), {
    message: "Date of birth must be in the past",
  }),
});

export const submitEnrollmentSchema = z.object({
  benefitPlanId: z.string().uuid(),
  enrollmentWindowId: z.string().uuid(),
  coverageTier: z.string().min(1),
  dependents: z.array(dependentSchema),
});

export type DependentFormValues = z.infer<typeof dependentSchema>;
export type SubmitEnrollmentFormValues = z.infer<typeof submitEnrollmentSchema>;
