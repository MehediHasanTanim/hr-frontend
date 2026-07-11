// src/features/integrations/webhooks/components/DeliveryLogTable.tsx
// Sprint 12 F2 — Paginated delivery log with polling while PENDING

"use client";
import React from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useWebhookDeliveries } from "../hooks";
import type { DeliveryStatus } from "../types";

const STATUS_BADGE: Record<DeliveryStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "Pending", variant: "outline" },
  SUCCESS: { label: "Success", variant: "default" },
  FAILED: { label: "Failed", variant: "destructive" },
  EXHAUSTED: { label: "Exhausted", variant: "secondary" },
};

function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const diff = new Date(iso).getTime() - Date.now();
  const mins = Math.round(diff / 60000);
  if (mins <= 0) return "now";
  return `in ${mins}m`;
}

interface Props { webhookId: string; }

export function DeliveryLogTable({ webhookId }: Props) {
  const { data, isLoading, isError } = useWebhookDeliveries(webhookId);

  if (isLoading) return <div className="flex py-8 justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (isError) return <div className="py-4 text-sm text-destructive">Failed to load delivery log.</div>;

  const deliveries = data ?? [];
  return (
    <div data-testid="delivery-log-table">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Delivery Log ({deliveries.length})</h3>
        {deliveries.some((d) => d.status === "PENDING") && (
          <span className="text-xs text-muted-foreground">Auto-refreshing...</span>
        )}
      </div>
      {deliveries.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No deliveries yet.</p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr><th className="px-3 py-2 text-left">Event</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-center">Attempts</th><th className="px-3 py-2 text-right">Latency</th><th className="px-3 py-2 text-center">Response</th><th className="px-3 py-2 text-right">Next Retry</th><th className="px-3 py-2 text-right">Time</th></tr></thead>
            <tbody>
              {deliveries.map((d) => {
                const badge = STATUS_BADGE[d.status];
                return (
                  <tr key={d.id} data-testid={`delivery-row-${d.id}`} className="border-t hover:bg-muted/30">
                    <td className="px-3 py-2 text-xs">{d.eventType}</td>
                    <td className="px-3 py-2"><Badge variant={badge.variant}>{badge.label}</Badge></td>
                    <td className="px-3 py-2 text-center">{d.attemptCount}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{d.status === "PENDING" ? "—" : (d.lastAttemptAt ? "✓" : "—")}</td>
                    <td className="px-3 py-2 text-center font-mono text-xs">{d.responseCode ?? "—"}</td>
                    <td className="px-3 py-2 text-right text-xs text-muted-foreground">{relativeTime(d.nextRetryAt)}</td>
                    <td className="px-3 py-2 text-right text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
