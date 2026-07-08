// src/features/surveys/components/SurveyPreviewPane.tsx
// Sprint 10 F4 — Preview pane rendering survey as employee would see it
// Uses same widget components as SurveyResponseForm for visual consistency.

"use client";

import React from "react";
import { RatingStarsInput } from "./widgets/RatingStarsInput";
import { SingleChoiceInput } from "./widgets/SingleChoiceInput";
import { MultiChoiceInput } from "./widgets/MultiChoiceInput";
import { FreeTextInput } from "./widgets/FreeTextInput";
import type { SurveyQuestionDraft } from "@/features/surveys/types/surveys.types";

interface SurveyPreviewPaneProps {
  title: string;
  description: string;
  questions: SurveyQuestionDraft[];
}

export function SurveyPreviewPane({
  title,
  description,
  questions,
}: SurveyPreviewPaneProps) {
  return (
    <div
      data-testid="survey-preview-pane"
      className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-6"
    >
      <p className="text-xs font-medium text-primary mb-4">
        PREVIEW — This is how employees will see your survey
      </p>
      <h3 className="text-lg font-bold">{title || "Untitled Survey"}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}

      <div className="mt-6 space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="space-y-2">
            <p className="text-sm font-medium">
              {idx + 1}. {q.prompt || "(No prompt)"}
              {q.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </p>
            {q.type === "LIKERT_5" && (
              <RatingStarsInput
                value={null}
                onChange={() => {}}
                questionId={`preview-${q.id}`}
                disabled
              />
            )}
            {q.type === "SINGLE_CHOICE" && (
              <SingleChoiceInput
                options={q.options ?? []}
                value={null}
                onChange={() => {}}
                questionId={`preview-${q.id}`}
                disabled
              />
            )}
            {q.type === "MULTI_CHOICE" && (
              <MultiChoiceInput
                options={q.options ?? []}
                value={[]}
                onChange={() => {}}
                questionId={`preview-${q.id}`}
                disabled
              />
            )}
            {q.type === "FREE_TEXT" && (
              <FreeTextInput
                value=""
                onChange={() => {}}
                questionId={`preview-${q.id}`}
                disabled
              />
            )}
          </div>
        ))}
      </div>

      {questions.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No questions added yet.
        </p>
      )}
    </div>
  );
}
