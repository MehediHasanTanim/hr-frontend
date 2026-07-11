// src/app/(dashboard)/settings/integrations/slack/page.tsx
import React from "react";
import { SlackConnectCard } from "@/features/integrations/slack/components/SlackConnectCard";

export default function SlackIntegrationPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Slack Integration</h1>
      <SlackConnectCard />
    </div>
  );
}
