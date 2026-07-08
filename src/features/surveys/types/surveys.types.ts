// src/features/surveys/types/surveys.types.ts
// Sprint 10 — Survey Builder & Response Types

export type SurveyQuestionType =
  | "LIKERT_5"
  | "SINGLE_CHOICE"
  | "MULTI_CHOICE"
  | "FREE_TEXT";

export type SurveyStatus = "DRAFT" | "LAUNCHED" | "CLOSED";

export interface SurveyQuestionDraft {
  id: string; // client-generated temp id until saved
  orderIndex: number;
  prompt: string;
  type: SurveyQuestionType;
  options?: string[];
  required: boolean;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  status: SurveyStatus;
  questions: SurveyQuestionDraft[];
  closesAt: string | null;
  createdAt: string;
}

export interface SaveSurveyDto {
  title: string;
  description: string;
  questions: Omit<SurveyQuestionDraft, "id">[];
}

export interface LaunchSurveyDto {
  closesAt: string;
  audienceType: "ALL_EMPLOYEES";
}

export interface SurveyAssignment {
  surveyId: string;
  surveyTitle: string;
  status: "PENDING" | "COMPLETED";
  closesAt: string | null;
}

// Deliberately no employeeId — anonymity contract.
export interface SurveyResponseAnswer {
  questionId: string;
  answer: number | string | string[];
}

export interface SubmitSurveyResponseDto {
  surveyId: string;
  answers: SurveyResponseAnswer[];
}
