// src/features/surveys/components/widgets/SingleChoiceInput.tsx
// Sprint 10 F5 — Radio-group widget for single-choice survey questions

"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SingleChoiceInputProps {
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
  questionId: string;
  disabled?: boolean;
}

export function SingleChoiceInput({
  options,
  value,
  onChange,
  questionId,
  disabled = false,
}: SingleChoiceInputProps) {
  return (
    <div role="radiogroup" aria-required="true" className="space-y-2">
      {options.map((option, idx) => {
        const radioId = `${questionId}-opt-${idx}`;
        return (
          <label
            key={radioId}
            htmlFor={radioId}
            className={cn(
              "flex items-center gap-2 rounded-md border p-2.5 text-sm cursor-pointer transition-colors",
              value === option
                ? "border-primary bg-primary/5"
                : "hover:bg-muted/50",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            <input
              type="radio"
              id={radioId}
              name={questionId}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              disabled={disabled}
              data-testid={`radio-${questionId}-${idx}`}
              className="h-4 w-4 accent-primary"
            />
            {option}
          </label>
        );
      })}
    </div>
  );
}
