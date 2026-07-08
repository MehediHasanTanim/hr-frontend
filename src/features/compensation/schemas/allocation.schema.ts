// src/features/compensation/schemas/allocation.schema.ts
// Sprint 10 — Bonus Allocation Zod Schemas

import { z } from "zod";

export const proposeAllocationSchema = z.object({
  cycleId: z.string().uuid(),
  employeeId: z.string().uuid(),
  proposedAmount: z.number().positive().multipleOf(0.01),
});

export const approveAllocationSchema = z.object({
  cycleId: z.string().uuid(),
  employeeId: z.string().uuid(),
  approvedAmount: z.number().positive().multipleOf(0.01),
});

export type ProposeAllocationFormValues = z.infer<typeof proposeAllocationSchema>;
export type ApproveAllocationFormValues = z.infer<typeof approveAllocationSchema>;
