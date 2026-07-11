// src/features/integrations/webhooks/components/WebhookFormModal.tsx
"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRegisterWebhook } from "../hooks";
import { registerWebhookSchema, type RegisterWebhookForm } from "../../schemas";

const EVENT_OPTIONS: { value: string; label: string }[] = [
  { value: "employee.created", label: "Employee Created" },
  { value: "employee.updated", label: "Employee Updated" },
  { value: "employee.terminated", label: "Employee Terminated" },
  { value: "leave.approval_requested", label: "Leave Approval Requested" },
  { value: "leave.approved", label: "Leave Approved" },
  { value: "leave.rejected", label: "Leave Rejected" },
  { value: "payroll.cycle_completed", label: "Payroll Cycle Completed" },
  { value: "payroll.payslip_generated", label: "Payslip Generated" },
  { value: "review.completed", label: "Review Completed" },
];

interface Props { onClose: () => void; webhookId?: string; }

export function WebhookFormModal({ onClose, webhookId }: Props) {
  const mutation = useRegisterWebhook();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterWebhookForm>({
    resolver: zodResolver(registerWebhookSchema),
    defaultValues: { url: "", subscribedEvents: [] },
  });

  const onSubmit = (data: RegisterWebhookForm) => {
    mutation.mutate(data, { onSuccess: () => onClose() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-lg bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{webhookId ? "Edit Webhook" : "Register Webhook"}</h3>
          <button onClick={onClose} className="rounded p-1" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Endpoint URL (HTTPS)</label>
            <Input {...register("url")} data-testid="webhook-url" placeholder="https://your-service.com/webhook" />
            {errors.url && <p className="mt-1 text-xs text-destructive">{errors.url.message}</p>}
            <p className="mt-1 text-xs text-muted-foreground">Must be an HTTPS URL. This is a UX check only — the backend enforces the actual SSRF guard.</p>
          </div>
          <fieldset>
            <legend className="block text-sm font-medium mb-2">Subscribe to Events</legend>
            <div data-testid="event-subscription-group" className="grid grid-cols-2 gap-2">
              {EVENT_OPTIONS.map((ev) => (
                <label key={ev.value} className="flex items-center gap-2 text-sm rounded border p-2 cursor-pointer hover:bg-muted/50">
                  <input type="checkbox" value={ev.value} {...register("subscribedEvents")} data-testid={`event-${ev.value}`} className="rounded accent-primary" />
                  {ev.label}
                </label>
              ))}
            </div>
            {errors.subscribedEvents && <p className="mt-1 text-xs text-destructive">{errors.subscribedEvents.message}</p>}
          </fieldset>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
            <button type="submit" data-testid="submit-webhook" disabled={mutation.isPending} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
