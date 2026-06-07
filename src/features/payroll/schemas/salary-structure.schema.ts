import { z } from 'zod';

export const salaryStructureSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  components: z
    .array(
      z.object({
        componentId: z.string().uuid(),
        sortOrder: z.number().int().min(1),
        defaultValue: z.number().min(0),
      }),
    )
    .min(1, 'Add at least one component'),
});

export type SalaryStructureFormValues = z.infer<typeof salaryStructureSchema>;
