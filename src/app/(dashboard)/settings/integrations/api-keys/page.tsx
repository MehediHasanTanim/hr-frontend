// src/app/(dashboard)/settings/integrations/api-keys/page.tsx
import React from "react";
import { ApiKeyList } from "@/features/integrations/api-keys/components/ApiKeyList";

export default function ApiKeysPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">API Keys</h1>
      <ApiKeyList />
    </div>
  );
}
