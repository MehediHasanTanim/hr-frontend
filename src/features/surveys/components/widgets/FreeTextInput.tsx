// src/features/surveys/components/widgets/FreeTextInput.tsx
// Sprint 10 F5 — Free-text textarea widget for survey questions

"use client";

import React from "react";
import { cn } from "@/lib/utils";

const MAX_LENGTH = 2000;

interface FreeTextInputProps {
  value: string;
  onChange: (value: string) => void;
  questionId: string;
  disabled?: boolean;
}

export function FreeTextInput({
  value,
  onChange,
  questionId,
  disabled = false,
}: FreeTextInputProps) {
  return (
    <div>
      <textarea
        id={`free-text-${questionId}`}
        data-testid={`free-text-${questionId}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={MAX_LENGTH}
        rows={4}
        placeholder="Type your answer..."
        className={cn(
          "w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          "ring-offset-background placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      />
      <p className="mt-1 text-xs text-muted-foreground text-right">
        {value.length} / {MAX_LENGTH}
      </p>
    </div>
  );
}
