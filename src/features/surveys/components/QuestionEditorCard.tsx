// src/features/surveys/components/QuestionEditorCard.tsx
// Sprint 10 F4 — Editable question card for the survey builder

"use client";

import React from "react";
import { GripVertical, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SurveyQuestionDraft } from "@/features/surveys/types/surveys.types";

interface QuestionEditorCardProps {
  question: SurveyQuestionDraft;
  index: number;
  onChange: (q: SurveyQuestionDraft) => void;
  onRemove: (id: string) => void;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function QuestionEditorCard({
  question,
  index,
  onChange,
  onRemove,
  isDragging = false,
  dragHandleProps,
}: QuestionEditorCardProps) {
  const needsOptions =
    question.type === "SINGLE_CHOICE" || question.type === "MULTI_CHOICE";

  return (
    <div
      data-testid={`question-card-${question.id}`}
      className={cn(
        "rounded-lg border p-4 space-y-3 transition-opacity",
        isDragging && "opacity-50",
      )}
    >
      <div className="flex items-start gap-3">
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            data-testid={`drag-handle-${question.id}`}
            className="mt-2 cursor-grab text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Drag to reorder"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();
                // Reorder via keyboard: emit custom action handled by SurveyBuilder
                const event = new CustomEvent("question-reorder-keyboard", {
                  detail: { questionId: question.id, direction: e.key === "ArrowUp" ? "up" : "down" },
                  bubbles: true,
                });
                e.currentTarget.dispatchEvent(event);
              }
            }}
          >
            <GripVertical className="h-5 w-5" />
          </div>
        )}

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Question {index + 1} —{" "}
              {question.type === "LIKERT_5"
                ? "Rating"
                : question.type === "SINGLE_CHOICE"
                  ? "Single Choice"
                  : question.type === "MULTI_CHOICE"
                    ? "Multi Choice"
                    : "Free Text"}
            </span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={question.required}
                  data-testid={`required-toggle-${question.id}`}
                  onChange={(e) =>
                    onChange({ ...question, required: e.target.checked })
                  }
                  className="h-3.5 w-3.5 rounded accent-primary"
                />
                Required
              </label>
              <button
                type="button"
                data-testid={`remove-question-${question.id}`}
                onClick={() => onRemove(question.id)}
                className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                aria-label="Remove question"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Input
            value={question.prompt}
            data-testid={`question-prompt-${question.id}`}
            onChange={(e) =>
              onChange({ ...question, prompt: e.target.value })
            }
            placeholder="Enter question prompt..."
          />

          {needsOptions && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Options
              </p>
              {(question.options ?? []).map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <Input
                    value={opt}
                    data-testid={`option-${question.id}-${optIdx}`}
                    onChange={(e) => {
                      const newOptions = [...(question.options ?? [])];
                      newOptions[optIdx] = e.target.value;
                      onChange({ ...question, options: newOptions });
                    }}
                    placeholder={`Option ${optIdx + 1}`}
                    className="h-8 text-sm"
                  />
                  <button
                    type="button"
                    data-testid={`remove-option-${question.id}-${optIdx}`}
                    onClick={() => {
                      const newOptions = [...(question.options ?? [])];
                      newOptions.splice(optIdx, 1);
                      onChange({ ...question, options: newOptions });
                    }}
                    className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Remove option"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                data-testid={`add-option-${question.id}`}
                onClick={() =>
                  onChange({
                    ...question,
                    options: [...(question.options ?? []), ""],
                  })
                }
                className="text-xs font-medium text-primary hover:underline"
              >
                + Add option
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
