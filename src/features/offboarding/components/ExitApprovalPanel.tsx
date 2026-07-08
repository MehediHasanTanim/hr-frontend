// src/features/offboarding/components/ExitApprovalPanel.tsx
// Sprint 11 F4 — Exit request approval panel (manager/HR)

"use client";
import React, { useState } from "react";
import { Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ExitRequestStatusStepper } from "./ExitRequestStatusStepper";
import { useExitRequests, useApproveExitRequest, useRejectExitRequest } from "@/features/offboarding/hooks/useExitRequests";
import { cn } from "@/lib/utils";
import type { ExitRequest } from "@/features/offboarding/types/offboarding";

export function ExitApprovalPanel() {
  const { data, isLoading, isError } = useExitRequests();
  const approveMutation = useApproveExitRequest();
  const rejectMutation = useRejectExitRequest();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  if (isLoading) return <div className="flex py-12 justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (isError) return <div className="py-8 text-center text-sm text-destructive">Unable to load exit requests.</div>;

  const pending = (data ?? []).filter((r) =>
    r.status === "SUBMITTED" || r.status === "PENDING_MANAGER_APPROVAL",
  );

  if (pending.length === 0) {
    return <div className="py-8 text-center text-sm text-muted-foreground">No pending exit requests.</div>;
  }

  const handleReject = (id: string) => {
    if (!rejectionReason.trim()) return;
    rejectMutation.mutate({ id, rejectionReason: rejectionReason.trim() }, {
      onSuccess: () => { setRejectingId(null); setRejectionReason(""); },
    });
  };

  return (
    <div data-testid="exit-approval-panel" className="space-y-4">
      <h3 className="text-lg font-semibold">Pending Exit Requests ({pending.length})</h3>
      {pending.map((req) => (
        <div key={req.id} data-testid={`exit-approval-${req.id}`} className="rounded-lg border p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium">{req.employeeName}</p>
              <p className="text-xs text-muted-foreground">
                {req.reasonType} · LWD: {req.requestedLastWorkingDay}
              </p>
              {req.reasonNotes && <p className="text-xs text-muted-foreground mt-1">{req.reasonNotes}</p>}
            </div>
          </div>

          <ExitRequestStatusStepper status={req.status} />

          {rejectingId === req.id ? (
            <div className="flex items-center gap-2">
              <Input
                data-testid={`reject-reason-${req.id}`}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Rejection reason (required)"
                className="h-8 text-sm flex-1"
              />
              <button
                data-testid={`confirm-reject-${req.id}`}
                onClick={() => handleReject(req.id)}
                disabled={!rejectionReason.trim() || rejectMutation.isPending}
                className="rounded bg-destructive px-2 py-1 text-xs text-white disabled:opacity-50"
              >Confirm</button>
              <button onClick={() => { setRejectingId(null); setRejectionReason(""); }} className="text-xs text-muted-foreground">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                data-testid={`approve-exit-${req.id}`}
                onClick={() => approveMutation.mutate(req.id)}
                disabled={approveMutation.isPending}
                className="rounded bg-green-600 px-3 py-1.5 text-xs text-white disabled:opacity-50"
              >Approve</button>
              <button
                data-testid={`reject-exit-${req.id}`}
                onClick={() => setRejectingId(req.id)}
                className="rounded bg-destructive px-3 py-1.5 text-xs text-white"
              >Reject</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
