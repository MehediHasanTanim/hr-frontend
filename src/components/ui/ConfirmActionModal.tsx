// src/components/ui/ConfirmActionModal.tsx
// Sprint 8 — Shared confirmation modal for consequential/audited actions
// Used by: PIP initiate/close, calibration override, review acknowledge

"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";

interface ConfirmActionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (justification?: string) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "default" | "destructive";
  requireJustification?: boolean;
  justificationLabel?: string;
  isPending?: boolean;
}

const justificationSchema = z.object({
  justification: z.string().min(1, "Justification is required").max(500),
});

export function ConfirmActionModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "default",
  requireJustification = false,
  justificationLabel = "Justification",
  isPending = false,
}: ConfirmActionModalProps) {
  const form = useForm<{ justification: string }>({
    resolver: zodResolver(requireJustification ? justificationSchema : z.object({ justification: z.string().optional() })),
    defaultValues: { justification: "" },
  });

  function handleSubmit(data: { justification: string }) {
    onConfirm(requireJustification ? data.justification : undefined);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent data-testid="confirm-action-modal">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {variant === "destructive" && (
              <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
            )}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {requireJustification && (
            <div className="space-y-1">
              <Label htmlFor="justification">{justificationLabel} *</Label>
              <Textarea
                id="justification"
                {...form.register("justification")}
                rows={3}
                placeholder={`Enter ${justificationLabel.toLowerCase()}...`}
                data-testid="confirm-justification"
                aria-invalid={!!form.formState.errors.justification}
              />
              {form.formState.errors.justification && (
                <p className="text-xs text-red-500" role="alert" data-testid="confirm-justification-error">
                  {form.formState.errors.justification.message}
                </p>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={variant}
              disabled={isPending}
              data-testid="confirm-action-btn"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
