// src/app/(dashboard)/settings/integrations/page.tsx
// Sprint 12 — Integrations Overview

import React from "react";
import Link from "next/link";
import { Key, Webhook } from "lucide-react";

export default function IntegrationsOverviewPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Integrations</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/settings/integrations/api-keys" className="rounded-lg border p-6 hover:border-primary transition-colors">
          <Key className="h-8 w-8 text-primary mb-3" />
          <h3 className="text-lg font-semibold">API Keys</h3>
          <p className="text-sm text-muted-foreground mt-1">Manage API keys for programmatic access</p>
        </Link>
        <Link href="/settings/integrations/webhooks" className="rounded-lg border p-6 hover:border-primary transition-colors">
          <Webhook className="h-8 w-8 text-primary mb-3" />
          <h3 className="text-lg font-semibold">Webhooks</h3>
          <p className="text-sm text-muted-foreground mt-1">Register endpoints and view delivery logs</p>
        </Link>
        <Link href="/settings/integrations/slack" className="rounded-lg border p-6 hover:border-primary transition-colors">
          <span className="text-2xl">💬</span>
          <h3 className="text-lg font-semibold mt-2">Slack</h3>
          <p className="text-sm text-muted-foreground mt-1">Connect Slack for real-time notifications</p>
        </Link>
      </div>
    </div>
  );
}
