// src/features/offboarding/components/ResignationForm.tsx
// Sprint 11 F4 — Employee-facing resignation form (reasonType hardcoded to RESIGNATION)

"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCreateExitRequest } from "@/features/offboarding/hooks/useExitRequests";
import { createExitRequestSchema, type CreateExitRequestFormValues } from "@/features/offboarding/schemas/offboarding.schema";

interface Props { employeeId: string; onSuccess?: () => void; }

export function ResignationForm({ employeeId, onSuccess }: Props) {
  const mutation = useCreateExitRequest();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateExitRequestFormValues>({
    resolver: zodResolver(createExitRequestSchema),
    defaultValues: { employeeId, reasonType: "RESIGNATION" },
  });

  const onSubmit = (data: CreateExitRequestFormValues) => {
    mutation.mutate(data, { onSuccess });
  };

  if (mutation.isSuccess) {
    return (
      <div data-testid="resignation-success" className="rounded-md bg-green-50 border border-green-200 p-6 text-center">
        <h3 className="text-lg font-semibold text-green-800">Resignation Submitted</h3>
        <p className="mt-1 text-sm text-green-700">Your resignation has been submitted and is pending approval.</p>
      </div>
    );
  }

  return (
    <form data-testid="resignation-form" onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4">
      <h3 className="text-lg font-semibold">Submit Resignation</h3>
      <p className="text-sm text-muted-foreground">Submitting a resignation will begin the offboarding process. This cannot be undone.</p>

      <div>
        <label className="block text-sm font-medium mb-1">Last Working Day</label>
        <Input type="date" {...register("requestedLastWorkingDay")} data-testid="resignation-lwd" />
        {errors.requestedLastWorkingDay && <p className="mt-1 text-xs text-destructive">{errors.requestedLastWorkingDay.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Reason (optional)</label>
        <textarea {...register("reasonNotes")} data-testid="resignation-notes" rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Brief reason for leaving..." />
      </div>

      {mutation.isError && <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">Failed to submit resignation.</div>}

      <button type="submit" data-testid="submit-resignation-btn" disabled={mutation.isPending} className="w-full rounded-md bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground disabled:opacity-50">
        {mutation.isPending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Submit Resignation"}
      </button>
    </form>
  );
}
