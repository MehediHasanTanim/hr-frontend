// src/features/integrations/slack/components/SlackConnectCard.tsx
// Sprint 12 — Slack integration connect/disconnect card

"use client";
import React from "react";
import { Loader2, ExternalLink, Unlink } from "lucide-react";
import { useSlackStatus } from "../hooks";

export function SlackConnectCard() {
  const { data, isLoading, isError } = useSlackStatus();

  if (isLoading) return <div className="rounded-lg border p-6"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  const connected = data?.connected;
  return (
    <div data-testid="slack-connect-card" className="rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Slack Integration</h3>
          {connected ? (
            <p className="text-sm text-green-700 font-medium mt-1">Connected to {data.workspaceName}</p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">Not connected. Connect to receive notifications in Slack.</p>
          )}
        </div>
        {connected ? (
          <button data-testid="disconnect-slack-btn" className="inline-flex items-center gap-1 rounded-md border border-destructive px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10">
            <Unlink className="h-4 w-4" /> Disconnect
          </button>
        ) : (
          <a href="/api/v1/integrations/slack/auth" data-testid="connect-slack-btn" className="inline-flex items-center gap-1 rounded-md bg-[#4A154B] px-4 py-2 text-sm text-white hover:bg-[#3E1140]">
            <ExternalLink className="h-4 w-4" /> Connect Slack
          </a>
        )}
      </div>
      {connected && (
        <div className="mt-4 rounded-md bg-muted/50 p-3 text-sm">
          <p className="font-medium mb-2">Channel Mappings</p>
          <div className="space-y-1 text-muted-foreground">
            <p>• Leave Approval → #hr-leave-alerts</p>
            <p>• Review Completed → #hr-reviews</p>
          </div>
          <p className="text-xs text-amber-600 mt-2">(Mapping configuration available in next sprint)</p>
        </div>
      )}
    </div>
  );
}
