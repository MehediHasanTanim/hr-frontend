import { z } from 'zod';

export const leaveTypeSchema = z
  .object({
    name: z.string().min(2).max(100),
    code: z
      .string()
      .min(2)
      .max(30)
      .regex(
        /^[A-Z0-9_]+$/,
        'Code must be uppercase letters, numbers, or underscores',
      ),
    accrualType: z.enum(['monthly', 'annual', 'none']),
    accrualAmount: z.number().min(0).max(30),
    maxBalance: z.number().min(1).max(365),
    maxCarryForward: z.number().min(0),
    isPaid: z.boolean(),
  })
  .refine(
    (d) =>
      d.accrualType === 'none' ? d.accrualAmount === 0 : d.accrualAmount > 0,
    {
      message:
        'Accrual amount must be 0 for None type, and > 0 for others',
      path: ['accrualAmount'],
    },
  )
  .refine(
    (d) => d.maxCarryForward <= d.maxBalance,
    {
      message: 'Carry forward cannot exceed max balance',
      path: ['maxCarryForward'],
    },
  );

export type LeaveTypeFormValues = z.infer<typeof leaveTypeSchema>;
