// src/features/recruitment/kanban/components/RejectModal.tsx
// Sprint 7 F1 — Rejection modal with required reason

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
import { Loader2 } from "lucide-react";
import { useRejectApplication } from "../../applications/api";

const rejectSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required').max(500),
});

type RejectForm = z.infer<typeof rejectSchema>;

interface RejectModalProps {
  applicationId: string;
  candidateName: string;
  open: boolean;
  onClose: () => void;
}

export function RejectModal({ applicationId, candidateName, open, onClose }: RejectModalProps) {
  const reject = useRejectApplication();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RejectForm>({
    resolver: zodResolver(rejectSchema),
  });

  function onSubmit(data: RejectForm) {
    reject.mutate(
      { id: applicationId, reason: data.reason },
      { onSuccess: () => onClose() },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent data-testid="reject-modal">
        <DialogHeader>
          <DialogTitle>Reject Application</DialogTitle>
          <DialogDescription>
            Reject <strong>{candidateName}</strong>'s application. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="reject-reason">Reason for rejection *</Label>
            <Textarea
              id="reject-reason"
              {...register("reason")}
              placeholder="Provide a reason for rejecting this application..."
              rows={3}
              data-testid="reject-reason-textarea"
              aria-invalid={!!errors.reason}
            />
            {errors.reason && (
              <p className="text-xs text-red-500" role="alert" data-testid="reject-reason-error">
                {errors.reason.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={reject.isPending}
              data-testid="confirm-reject-btn"
            >
              {reject.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject Application
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
