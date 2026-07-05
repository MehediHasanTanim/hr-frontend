// src/features/mss/components/ApproveRejectModal.tsx
// Sprint 6 — Approve/Reject modal with remarks

"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useToastStore } from "@/stores/toast.store";
import { useApproveLeave, useRejectLeave } from "../hooks/useTeamLeaveRequests";
import {
  approvalRemarksSchema,
  rejectionSchema,
  type ApprovalRemarks,
  type RejectionForm,
} from "../schemas/approval.schema";

interface ApproveRejectModalProps {
  requestId: string | string[];
  action: "approve" | "reject";
  onClose: () => void;
}

export function ApproveRejectModal({ requestId, action, onClose }: ApproveRejectModalProps) {
  const approve = useApproveLeave();
  const reject = useRejectLeave();
  const isPending = approve.isPending || reject.isPending;
  const isBulk = Array.isArray(requestId);

  const isApprove = action === "approve";
  const schema = isApprove ? approvalRemarksSchema : rejectionSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApprovalRemarks & RejectionForm>({
    resolver: zodResolver(schema),
    defaultValues: { remarks: "", reason: "" },
  });

  async function onSubmit(data: ApprovalRemarks & RejectionForm) {
    const addToast = useToastStore.getState().addToast;
    const ids = Array.isArray(requestId) ? requestId : [requestId];
    const results = await Promise.allSettled(
      ids.map((id) =>
        isApprove
          ? approve.mutateAsync({ id, remarks: data.remarks })
          : reject.mutateAsync({ id, reason: data.reason }),
      ),
    );

    const failedCount = results.filter((r) => r.status === "rejected").length;
    if (isBulk && failedCount > 0) {
      addToast({
        message: `${ids.length - failedCount} of ${ids.length} ${isApprove ? "approved" : "rejected"}. ${failedCount} failed.`,
        variant: "danger",
        duration: 6000,
      });
    }

    onClose();
  }

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent data-testid="approve-reject-modal">
        <DialogHeader>
          <DialogTitle>
            {isApprove ? "Approve" : "Reject"} Leave Request{isBulk ? `s (${(requestId as string[]).length})` : ""}
          </DialogTitle>
          <DialogDescription>
            {isApprove
              ? "Add optional remarks for this approval."
              : "Please provide a reason for rejection."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor={isApprove ? "remarks" : "reason"}>
              {isApprove ? "Remarks (optional)" : "Rejection Reason"}
            </Label>
            <Textarea
              id={isApprove ? "remarks" : "reason"}
              {...register(isApprove ? "remarks" : "reason")}
              placeholder={
                isApprove ? "Optional remarks..." : "Reason for rejection is required"
              }
              rows={3}
              data-testid={isApprove ? "approve-remarks" : "reject-reason-input"}
              aria-invalid={
                isApprove
                  ? !!errors.remarks
                  : !!(errors as unknown as { reason?: { message?: string } }).reason
              }
            />
            {!isApprove && (errors as unknown as { reason?: { message?: string } }).reason && (
              <p className="text-xs text-red-500" role="alert" data-testid="reject-reason-error">
                {(errors as unknown as { reason: { message: string } }).reason.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              variant={isApprove ? "default" : "destructive"}
              data-testid={isApprove ? "confirm-approve-btn" : "confirm-reject-btn"}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isApprove ? "Approve" : "Reject"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
