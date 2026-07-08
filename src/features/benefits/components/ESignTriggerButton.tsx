// src/features/benefits/components/ESignTriggerButton.tsx
// Sprint 10 F1 — eSign Trigger Button (stub — see §8 open question)
//
// This is a placeholder until the eSign provider is confirmed.
// In production this will open the eSign iframe/modal from the org's
// chosen provider (DocuSign, HelloSign, etc.).

"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ESignTriggerButtonProps {
  isPending: boolean;
  onSign: () => void;
  disabled: boolean;
}

export function ESignTriggerButton({
  isPending,
  onSign,
  disabled,
}: ESignTriggerButtonProps) {
  return (
    <button
      type="button"
      data-testid="esign-trigger-btn"
      onClick={onSign}
      disabled={disabled || isPending}
      className={cn(
        "inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground",
        "hover:bg-primary/90 disabled:opacity-50 transition-colors",
      )}
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        "Sign & Submit"
      )}
    </button>
  );
}
