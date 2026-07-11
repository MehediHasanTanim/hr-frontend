// src/app/(dashboard)/settings/integrations/webhooks/[id]/page.tsx
// Sprint 12 F2 — Webhook detail with delivery log + test ping

"use client";
import React from "react";
import { useParams } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { useWebhook, useTestPing } from "@/features/integrations/webhooks/hooks";
import { DeliveryLogTable } from "@/features/integrations/webhooks/components/DeliveryLogTable";
import { Badge } from "@/components/ui/badge";

export default function WebhookDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: wh, isLoading, isError } = useWebhook(params?.id ?? "");
  const testPing = useTestPing();

  if (isLoading) return <div className="flex py-12 justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (isError || !wh) return <div className="container mx-auto max-w-5xl px-4 py-8 text-destructive">Webhook not found.</div>;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhook Detail</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1 break-all">{wh.url}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={wh.status === "ACTIVE" ? "default" : "destructive"}>{wh.status}</Badge>
          <button
            data-testid="test-ping-btn"
            onClick={() => testPing.mutate(wh.id)}
            disabled={testPing.isPending}
            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            {testPing.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Test Ping
          </button>
        </div>
      </div>

      {wh.status === "INACTIVE" && (
        <div data-testid="deactivated-banner" className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          This endpoint has been deactivated after {wh.failedCount} consecutive failures. Reactivation is pending backend confirmation.
        </div>
      )}

      <DeliveryLogTable webhookId={wh.id} />
    </div>
  );
}
