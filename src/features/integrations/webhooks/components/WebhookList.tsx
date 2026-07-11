// src/features/integrations/webhooks/components/WebhookList.tsx
// Sprint 12 F2 — Webhook management list + register form + delivery log

"use client";
import React, { useState } from "react";
import { Loader2, Plus, ExternalLink, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useWebhooks } from "../hooks";
import { WebhookFormModal } from "./WebhookFormModal";
import type { WebhookCreatedResponse } from "../types";

const EVENT_LABELS: Record<string, string> = {
  "employee.created": "Employee Created",
  "employee.updated": "Employee Updated",
  "employee.terminated": "Employee Terminated",
  "leave.approval_requested": "Leave Approval Requested",
  "leave.approved": "Leave Approved",
  "leave.rejected": "Leave Rejected",
  "payroll.cycle_completed": "Payroll Cycle Completed",
  "payroll.payslip_generated": "Payslip Generated",
  "review.completed": "Review Completed",
};

export function WebhookList() {
  const { data, isLoading, isError } = useWebhooks();
  const [showForm, setShowForm] = useState(false);

  if (isLoading) return <div className="flex py-8 justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (isError) return <div className="py-4 text-sm text-destructive">Failed to load webhooks.</div>;

  const webhooks = data ?? [];
  return (
    <div data-testid="webhook-list" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Webhooks ({webhooks.length})</h3>
        <button data-testid="register-webhook-btn" onClick={() => setShowForm(true)} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
          <Plus className="h-4 w-4" /> Register Webhook
        </button>
      </div>

      {webhooks.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No webhooks registered yet.</p>
      ) : (
        <div className="space-y-3">
          {webhooks.map((wh) => (
            <div key={wh.id} data-testid={`webhook-row-${wh.id}`} className="rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm break-all">{wh.url}</span>
                    <Badge variant={wh.status === "ACTIVE" ? "default" : "destructive"}>{wh.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {wh.subscribedEvents.map((ev) => (
                      <Badge key={ev} variant="outline" className="text-[10px]">{EVENT_LABELS[ev] ?? ev}</Badge>
                    ))}
                  </div>
                  {wh.status === "INACTIVE" && (
                    <p className="text-xs text-amber-600">Deactivated after {wh.failedCount} consecutive failures.</p>
                  )}
                  <p className="text-xs text-muted-foreground">Secret prefix: {wh.secretPrefix}{"•".repeat(16)}</p>
                </div>
                <a href={`/settings/integrations/webhooks/${wh.id}`} data-testid={`view-deliveries-${wh.id}`} className="shrink-0 rounded p-1.5 text-muted-foreground hover:text-foreground" title="View delivery log">
                  <Activity className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <WebhookFormModal onClose={() => setShowForm(false)} />}
    </div>
  );
}
