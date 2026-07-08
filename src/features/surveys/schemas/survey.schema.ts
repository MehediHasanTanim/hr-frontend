// src/features/surveys/schemas/survey.schema.ts
// Sprint 10 — Survey Builder & Response Zod Schemas

import { z } from "zod";

export const surveyQuestionSchema = z
  .object({
    prompt: z.string().min(1).max(500),
    type: z.enum(["LIKERT_5", "SINGLE_CHOICE", "MULTI_CHOICE", "FREE_TEXT"]),
    options: z.array(z.string()).optional(),
    required: z.boolean(),
  })
  .refine(
    (q) =>
      q.type === "SINGLE_CHOICE" || q.type === "MULTI_CHOICE"
        ? !!q.options?.length
        : true,
    { message: "Choice questions require at least one option" },
  );

export const saveSurveySchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000),
  questions: z.array(surveyQuestionSchema).min(1, "At least one question is required"),
});

export const launchSurveySchema = z.object({
  closesAt: z.string().refine((d) => new Date(d) > new Date(), {
    message: "Close date must be in the future",
  }),
  audienceType: z.literal("ALL_EMPLOYEES"),
});

// Deliberately no employeeId field — anonymity contract.
export const surveyResponseAnswerSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.union([z.number(), z.string(), z.array(z.string())]),
});

export const submitSurveyResponseSchema = z.object({
  surveyId: z.string().uuid(),
  answers: z.array(surveyResponseAnswerSchema),
});

export type SaveSurveyFormValues = z.infer<typeof saveSurveySchema>;
export type LaunchSurveyFormValues = z.infer<typeof launchSurveySchema>;
export type SurveyResponseFormValues = z.infer<typeof submitSurveyResponseSchema>;
