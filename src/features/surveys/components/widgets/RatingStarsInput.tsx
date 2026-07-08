// src/features/surveys/components/widgets/RatingStarsInput.tsx
// Sprint 10 F4/F5 — Likert-scale rating input (5 stars)
//
// Accessibility: keyboard-focusable, arrow-key adjustable,
// role="radiogroup" with each star as role="radio".
// Must not be a div with onClick-only handlers.

"use client";

import React, { useCallback, useRef } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsInputProps {
  value: number | null;
  onChange: (value: number) => void;
  questionId: string;
  disabled?: boolean;
}

const MAX = 5;

export function RatingStarsInput({
  value,
  onChange,
  questionId,
  disabled = false,
}: RatingStarsInputProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, idx: number) => {
      let nextIdx = idx;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        nextIdx = Math.min(idx + 1, MAX - 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        nextIdx = Math.max(idx - 1, 0);
      }
      onChange(nextIdx + 1);
      refs.current[nextIdx]?.focus();
    },
    [onChange],
  );

  return (
    <div
      role="radiogroup"
      aria-label="Rating"
      aria-required="true"
      className="flex items-center gap-1"
    >
      {Array.from({ length: MAX }, (_, i) => {
        const starValue = i + 1;
        const isFilled = value !== null && starValue <= value;

        return (
          <button
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
            disabled={disabled}
            data-testid={`star-${questionId}-${starValue}`}
            onClick={() => onChange(starValue)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={cn(
              "rounded-sm p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
            )}
          >
            <Star
              className={cn(
                "h-8 w-8 transition-colors",
                isFilled
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30",
              )}
            />
          </button>
        );
      })}
      {value !== null && (
        <span className="ml-2 text-sm text-muted-foreground">
          {value} / {MAX}
        </span>
      )}
    </div>
  );
}
