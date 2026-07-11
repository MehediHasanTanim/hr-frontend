// src/features/integrations/api-keys/components/ApiKeyList.tsx
// Sprint 12 F1 — API Key list with create, reveal-once, revoke

"use client";
import React, { useState } from "react";
import { Loader2, Plus, Copy, Trash2, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from "../hooks";
import { ApiKeyCreateModal } from "./ApiKeyCreateModal";
import { ApiKeyRevealOnce } from "./ApiKeyRevealOnce";
import type { ApiKey, ApiKeyCreatedResponse } from "../types";
import { cn } from "@/lib/utils";

function maskPrefix(prefix: string): string {
  return `${prefix}${"•".repeat(18)}`;
}

export function ApiKeyList() {
  const { data, isLoading, isError } = useApiKeys();
  const revokeMutation = useRevokeApiKey();
  const [showCreate, setShowCreate] = useState(false);
  const [revealKey, setRevealKey] = useState<ApiKeyCreatedResponse | null>(null);

  if (isLoading) return <div className="flex py-8 justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (isError) return <div className="py-4 text-sm text-destructive">Failed to load API keys.</div>;

  const keys = data ?? [];
  return (
    <div data-testid="api-key-list" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">API Keys ({keys.length})</h3>
        <button data-testid="create-api-key-btn" onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
          <Plus className="h-4 w-4" /> Create Key
        </button>
      </div>

      {keys.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No API keys yet.</p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">Key</th><th className="px-3 py-2 text-left">Scopes</th><th className="px-3 py-2 text-left">Last Used</th><th className="px-3 py-2 text-left">Created</th><th className="px-3 py-2 text-right">Actions</th></tr></thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} data-testid={`api-key-row-${key.id}`} className={cn("border-t", key.status === "REVOKED" && "opacity-50")}>
                  <td className="px-3 py-2">
                    <span className="font-medium">{key.name}</span>
                    {key.status === "REVOKED" && <span className="ml-2 text-xs text-destructive">Revoked</span>}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{maskPrefix(key.prefix)}</td>
                  <td className="px-3 py-2"><div className="flex flex-wrap gap-1">{key.scopes.map((s) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}</div></td>
                  <td className="px-3 py-2 text-muted-foreground">{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{new Date(key.createdAt).toLocaleDateString()}</td>
                  <td className="px-3 py-2 text-right">
                    {key.status === "ACTIVE" && (
                      <button data-testid={`revoke-key-${key.id}`} onClick={() => { if (confirm("Revoke this API key? This cannot be undone.")) revokeMutation.mutate(key.id); }} className="rounded p-1 text-muted-foreground hover:text-destructive" title="Revoke"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && <ApiKeyCreateModal onClose={() => setShowCreate(false)} onCreated={(resp) => { setShowCreate(false); setRevealKey(resp); }} />}
      {revealKey && <ApiKeyRevealOnce apiKey={revealKey} onClose={() => setRevealKey(null)} />}
    </div>
  );
}
