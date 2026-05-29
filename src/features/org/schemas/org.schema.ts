import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().trim().min(1, "Department name is required"),
  code: z.string().trim().optional(),
  parentId: z.string().optional(),
  headId: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

export type DepartmentValues = z.infer<typeof departmentSchema>;
