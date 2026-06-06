import { z } from 'zod';

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export const leaveRequestSchema = z
  .object({
    leaveTypeId: z.string().uuid('Select a leave type'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    halfDay: z.enum(['full', 'first_half', 'second_half']).default('full'),
    reason: z.string().max(500).optional(),
  })
  .refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    { message: 'End date must be on or after start date', path: ['endDate'] },
  )
  .refine(
    (data) => new Date(data.startDate) >= startOfToday(),
    { message: 'Start date cannot be in the past', path: ['startDate'] },
  );

export type LeaveRequestFormValues = z.infer<typeof leaveRequestSchema>;
