// src/features/settings/schemas/template.schema.ts
// Sprint 6 — Notification template validation schema

import { z } from "zod";

export const templateSchema = z.object({
  subject: z.string().max(200).optional(),
  body: z.string().min(1, "Body is required").max(2000),
});

export type TemplateForm = z.infer<typeof templateSchema>;
