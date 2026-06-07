import { z } from 'zod';

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export const employeeSalarySchema = z.object({
  structureId: z.string().uuid('Select a salary structure'),
  ctc: z
    .number()
    .int('CTC must be a whole number')
    .min(12000, 'Minimum CTC is ₹12,000/year')
    .max(100_000_000),
  effectiveFrom: z.string().refine(
    (d) => new Date(d) >= startOfToday(),
    'Effective date cannot be in the past',
  ),
  notes: z.string().max(500).optional(),
  componentOverrides: z
    .array(
      z.object({
        componentId: z.string().uuid(),
        defaultValue: z.number().min(0),
      }),
    )
    .optional(),
});

export type EmployeeSalaryFormValues = z.infer<typeof employeeSalarySchema>;
