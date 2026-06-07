import { z } from 'zod';

export const salaryComponentSchema = z
  .object({
    name: z.string().min(2).max(100),
    code: z
      .string()
      .min(2)
      .max(30)
      .regex(
        /^[A-Z0-9_]+$/,
        'Uppercase letters, numbers, underscores only',
      ),
    type: z.enum(['earning', 'deduction', 'employer_contribution']),
    calculationType: z.enum(['fixed', 'formula', 'percentage_of_base']),
    formula: z.string().nullable(),
  })
  .refine(
    (d) => d.calculationType !== 'formula' || (d.formula && d.formula.length > 0),
    { message: 'Formula is required for formula type', path: ['formula'] },
  )
  .refine(
    (d) => d.calculationType === 'formula' || d.formula === null,
    {
      message: 'Formula must be empty for non-formula types',
      path: ['formula'],
    },
  );

export type SalaryComponentFormValues = z.infer<typeof salaryComponentSchema>;
