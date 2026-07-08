// src/features/surveys/components/SurveyResponseForm.tsx
// Sprint 10 F5 — Per-question widget renderer for survey responses
//
// CRITICAL: This form takes NO employeeId. Anonymity is enforced at
// the TypeScript type level — the SubmitSurveyResponseDto has no identity field.

"use client";

import React, { useState, useCallback } from "react";
import { Loader2, Send } from "lucide-react";
import { RatingStarsInput } from "./widgets/RatingStarsInput";
import { SingleChoiceInput } from "./widgets/SingleChoiceInput";
import { MultiChoiceInput } from "./widgets/MultiChoiceInput";
import { FreeTextInput } from "./widgets/FreeTextInput";
import { SubmitConfirmation } from "./SubmitConfirmation";
import { useSubmitSurveyResponseMutation } from "@/features/surveys/hooks/useSubmitSurveyResponseMutation";
import type {
  SurveyQuestionDraft,
  SurveyResponseAnswer,
} from "@/features/surveys/types/surveys.types";

interface SurveyResponseFormProps {
  surveyId: string;
  title: string;
  description: string;
  questions: SurveyQuestionDraft[];
}

type AnswerMap = Record<string, number | string | string[]>;

export function SurveyResponseForm({
  surveyId,
  title,
  description,
  questions,
}: SurveyResponseFormProps) {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submitMutation = useSubmitSurveyResponseMutation();

  const handleSetAnswer = useCallback(
    (questionId: string, answer: number | string | string[]) => {
      setAnswers((prev) => ({ ...prev, [questionId]: answer }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    },
    [],
  );

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    questions.forEach((q) => {
      if (q.required) {
        const a = answers[q.id];
        if (a === undefined || a === "" || a === null) {
          newErrors[q.id] = "This question requires an answer";
        } else if (Array.isArray(a) && a.length === 0) {
          newErrors[q.id] = "Select at least one option";
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const responseAnswers: SurveyResponseAnswer[] = questions
      .filter((q) => answers[q.id] !== undefined)
      .map((q) => ({
        questionId: q.id,
        answer: answers[q.id],
      }));

    // No employeeId anywhere in this payload — anonymity contract.
    submitMutation.mutate({ surveyId, answers: responseAnswers });
  };

  if (submitMutation.isSuccess) {
    return <SubmitConfirmation />;
  }

  return (
    <div data-testid="survey-response-form" className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-xl font-bold">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {questions.map((q, idx) => (
        <div
          key={q.id}
          data-testid={`response-question-${q.id}`}
          className="space-y-2"
        >
          <p className="text-sm font-medium">
            {idx + 1}. {q.prompt}
            {q.required && <span className="text-destructive ml-1">*</span>}
          </p>

          {q.type === "LIKERT_5" && (
            <RatingStarsInput
              value={(answers[q.id] as number) ?? null}
              onChange={(v) => handleSetAnswer(q.id, v)}
              questionId={q.id}
            />
          )}
          {q.type === "SINGLE_CHOICE" && (
            <SingleChoiceInput
              options={q.options ?? []}
              value={(answers[q.id] as string) ?? null}
              onChange={(v) => handleSetAnswer(q.id, v)}
              questionId={q.id}
            />
          )}
          {q.type === "MULTI_CHOICE" && (
            <MultiChoiceInput
              options={q.options ?? []}
              value={(answers[q.id] as string[]) ?? []}
              onChange={(v) => handleSetAnswer(q.id, v)}
              questionId={q.id}
            />
          )}
          {q.type === "FREE_TEXT" && (
            <FreeTextInput
              value={(answers[q.id] as string) ?? ""}
              onChange={(v) => handleSetAnswer(q.id, v)}
              questionId={q.id}
            />
          )}

          {errors[q.id] && (
            <p className="text-xs text-destructive">{errors[q.id]}</p>
          )}
        </div>
      ))}

      {/* Error banner */}
      {submitMutation.isError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          Failed to submit your response. Please try again.
        </div>
      )}

      <button
        type="button"
        data-testid="submit-survey-response-btn"
        onClick={handleSubmit}
        disabled={submitMutation.isPending}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {submitMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Submit Response
      </button>
    </div>
  );
}
