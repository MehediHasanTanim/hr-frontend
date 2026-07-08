// src/features/surveys/components/QuestionTypeSelector.tsx
// Sprint 10 F4 — Question type selection dropdown

"use client";

import React from "react";
import type { SurveyQuestionType } from "@/features/surveys/types/surveys.types";

const TYPE_OPTIONS: { value: SurveyQuestionType; label: string; desc: string }[] = [
  { value: "LIKERT_5", label: "Rating (1–5)", desc: "Star rating scale" },
  { value: "SINGLE_CHOICE", label: "Single Choice", desc: "Pick one option" },
  { value: "MULTI_CHOICE", label: "Multi Choice", desc: "Select all that apply" },
  { value: "FREE_TEXT", label: "Free Text", desc: "Open-ended response" },
];

interface QuestionTypeSelectorProps {
  onSelect: (type: SurveyQuestionType) => void;
}

export function QuestionTypeSelector({
  onSelect,
}: QuestionTypeSelectorProps) {
  return (
    <div data-testid="question-type-selector" className="grid gap-2 sm:grid-cols-2">
      {TYPE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          data-testid={`question-type-${opt.value}`}
          onClick={() => onSelect(opt.value)}
          className="rounded-lg border p-3 text-left transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="block text-sm font-medium">{opt.label}</span>
          <span className="block text-xs text-muted-foreground mt-0.5">
            {opt.desc}
          </span>
        </button>
      ))}
    </div>
  );
}
