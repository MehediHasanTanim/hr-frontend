// src/app/(dashboard)/settings/integrations/webhooks/page.tsx
import React from "react";
import { WebhookList } from "@/features/integrations/webhooks/components/WebhookList";

export default function WebhooksPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Webhooks</h1>
      <WebhookList />
    </div>
  );
}
