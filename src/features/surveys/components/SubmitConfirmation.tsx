// src/features/surveys/components/SubmitConfirmation.tsx
// Sprint 10 F5 — Anonymous submission confirmation
//
// Deliberately impersonal — does NOT render "Thanks, [Name]!"
// to avoid any implication the org can see who responded.
// Confirmation copy is a shared constant.

"use client";

import React from "react";
import { CheckCircle } from "lucide-react";

const CONFIRMATION_COPY = {
  heading: "Your response has been submitted anonymously.",
  body: "Thank you for your feedback. Your individual responses cannot be linked back to you.",
} as const;

export function SubmitConfirmation() {
  return (
    <div
      data-testid="survey-submit-confirmation"
      className="mx-auto max-w-md rounded-lg border border-green-200 bg-green-50 p-8 text-center"
    >
      <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
      <h3 className="mt-4 text-lg font-semibold text-green-800">
        {CONFIRMATION_COPY.heading}
      </h3>
      <p className="mt-2 text-sm text-green-700">
        {CONFIRMATION_COPY.body}
      </p>
    </div>
  );
}
