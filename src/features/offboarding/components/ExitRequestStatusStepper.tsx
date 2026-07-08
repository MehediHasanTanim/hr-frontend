// src/features/offboarding/components/ExitRequestStatusStepper.tsx
"use client";
import React from "react";
import { Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExitRequestStatus } from "@/features/offboarding/types/offboarding";

const STEPS = [
  { key: "SUBMITTED", label: "Submitted" },
  { key: "APPROVED", label: "Approved" },
  { key: "INTERVIEW_SCHEDULED", label: "Interview" },
  { key: "CHECKLIST_IN_PROGRESS", label: "Checklist" },
  { key: "COMPLETED", label: "Completed" },
] as const;

const STATUS_ORDER: ExitRequestStatus[] = [
  "SUBMITTED", "PENDING_MANAGER_APPROVAL", "APPROVED",
  "INTERVIEW_SCHEDULED", "CHECKLIST_IN_PROGRESS", "COMPLETED",
];

export function ExitRequestStatusStepper({ status }: { status: ExitRequestStatus }) {
  const isRejected = status === "REJECTED";
  const isCancelled = status === "CANCELLED";
  const isTerminal = isRejected || isCancelled;

  const currentIdx = isTerminal
    ? STATUS_ORDER.indexOf(isRejected ? "APPROVED" : "SUBMITTED")
    : STATUS_ORDER.indexOf(status);

  return (
    <div data-testid="exit-status-stepper">
      {isTerminal && (
        <div className={cn("mb-4 rounded-md p-3 text-sm font-medium", isRejected ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground")}>
          {isRejected ? "This exit request was rejected." : "This exit request was cancelled."}
        </div>
      )}
      <ol className="flex items-center gap-1">
        {STEPS.map((step, idx) => {
          const stepIdx = STATUS_ORDER.indexOf(step.key as ExitRequestStatus);
          const isComplete = !isTerminal && stepIdx <= currentIdx && stepIdx < currentIdx;
          const isCurrent = stepIdx === currentIdx && !isTerminal;

          return (
            <li key={step.key} className="flex items-center gap-1 flex-1">
              <div className={cn("flex flex-col items-center flex-1", isCurrent && "font-semibold")}>
                <span className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs",
                  isComplete && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary text-primary-foreground",
                  !isComplete && !isCurrent && "bg-muted text-muted-foreground",
                )}>
                  {isComplete ? <Check className="h-4 w-4" /> : idx + 1}
                </span>
                <span className="mt-1 text-[10px] text-center">{step.label}</span>
              </div>
              {idx < STEPS.length - 1 && <div className={cn("h-px flex-1", isComplete ? "bg-primary" : "bg-muted")} />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
