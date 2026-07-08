// src/app/(dashboard)/offboarding/[exitRequestId]/page.tsx
// Sprint 11 F4 — Exit request detail with checklist

"use client";
import React from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ExitRequestStatusStepper } from "@/features/offboarding/components/ExitRequestStatusStepper";
import { ChecklistTaskList } from "@/features/offboarding/components/ChecklistTaskList";
import { useExitRequest } from "@/features/offboarding/hooks/useExitRequests";

export default function ExitRequestDetailPage() {
  const params = useParams<{ exitRequestId: string }>();
  const { data, isLoading, isError } = useExitRequest(params?.exitRequestId ?? "");

  if (isLoading) return <div className="flex py-12 justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (isError || !data) return <div className="container mx-auto max-w-5xl px-4 py-8 text-sm text-destructive">Unable to load exit request.</div>;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Exit Request — {data.employeeName}</h1>
      <div className="rounded-lg border p-4 space-y-2">
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Type</span><span>{data.reasonType}</span></div>
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">LWD</span><span>{data.requestedLastWorkingDay}</span></div>
        {data.reasonNotes && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Notes</span><span>{data.reasonNotes}</span></div>}
        {data.rejectionReason && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Rejection Reason</span><span className="text-destructive">{data.rejectionReason}</span></div>}
      </div>
      <ExitRequestStatusStepper status={data.status} />
      <ChecklistTaskList exitRequestId={data.id} />
    </div>
  );
}
