// src/features/surveys/components/widgets/MultiChoiceInput.tsx
// Sprint 10 F5 — Checkbox-group widget for multi-choice survey questions

"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MultiChoiceInputProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  questionId: string;
  disabled?: boolean;
}

export function MultiChoiceInput({
  options,
  value,
  onChange,
  questionId,
  disabled = false,
}: MultiChoiceInputProps) {
  const handleToggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div role="group" aria-required="true" className="space-y-2">
      {options.map((option, idx) => {
        const checkId = `${questionId}-opt-${idx}`;
        return (
          <label
            key={checkId}
            htmlFor={checkId}
            className={cn(
              "flex items-center gap-2 rounded-md border p-2.5 text-sm cursor-pointer transition-colors",
              value.includes(option)
                ? "border-primary bg-primary/5"
                : "hover:bg-muted/50",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            <input
              type="checkbox"
              id={checkId}
              checked={value.includes(option)}
              onChange={() => handleToggle(option)}
              disabled={disabled}
              data-testid={`checkbox-${questionId}-${idx}`}
              className="h-4 w-4 rounded accent-primary"
            />
            {option}
          </label>
        );
      })}
    </div>
  );
}
