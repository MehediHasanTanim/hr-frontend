// src/features/surveys/components/LaunchSchedulerModal.tsx
// Sprint 10 F4 — Launch scheduler modal (sets closesAt, audience)
// §8 open question: audience targeting uses "ALL_EMPLOYEES" placeholder.

"use client";

import React, { useState } from "react";
import { Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLaunchSurveyMutation } from "@/features/surveys/hooks/useLaunchSurveyMutation";

interface LaunchSchedulerModalProps {
  surveyId: string;
  onClose: () => void;
}

export function LaunchSchedulerModal({
  surveyId,
  onClose,
}: LaunchSchedulerModalProps) {
  const [closesAt, setClosesAt] = useState("");
  const launchMutation = useLaunchSurveyMutation(surveyId);

  const handleLaunch = () => {
    if (!closesAt) return;
    launchMutation.mutate(
      { closesAt, audienceType: "ALL_EMPLOYEES" },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div
      data-testid="launch-scheduler-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-label="Launch survey"
    >
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Launch Survey</h3>
          <button
            type="button"
            data-testid="close-launch-modal"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Close Date
            </label>
            <Input
              type="datetime-local"
              data-testid="launch-closes-at"
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
            />
          </div>

          <div className="rounded-md bg-muted/50 p-3 text-sm">
            <p className="font-medium">Audience</p>
            <p className="text-muted-foreground mt-1">
              All employees will receive this survey.
            </p>
            <p className="text-xs text-amber-600 mt-1">
              (Audience targeting UI is a placeholder — all employees only.)
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              data-testid="confirm-launch-btn"
              onClick={handleLaunch}
              disabled={!closesAt || launchMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {launchMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Launch Survey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
