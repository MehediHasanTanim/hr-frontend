// src/features/integrations/api-keys/components/ApiKeyRevealOnce.tsx
// Sprint 12 F1 — One-time secret display with copy, requires explicit confirmation before closing
// NEVER persists rawKey to React Query cache, Zustand, or any storage.

"use client";
import React, { useState } from "react";
import { Copy, Check, AlertTriangle } from "lucide-react";
import type { ApiKeyCreatedResponse } from "../types";

interface Props { apiKey: ApiKeyCreatedResponse; onClose: () => void; }

export function ApiKeyRevealOnce({ apiKey, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey.rawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true" data-testid="api-key-reveal-modal">
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
        <AlertTriangle className="mx-auto h-8 w-8 text-amber-500 mb-3" />
        <h3 className="text-lg font-semibold text-center">Your API Key</h3>
        <p className="mt-1 text-sm text-destructive text-center font-medium">This key will not be shown again. Copy it now.</p>

        <div className="mt-4 rounded-md border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all text-xs font-mono select-all" data-testid="revealed-api-key">{apiKey.rawKey}</code>
            <button onClick={handleCopy} data-testid="copy-api-key-btn" className="shrink-0 rounded p-1.5 hover:bg-muted" title="Copy">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">Prefix: {apiKey.prefix} · Scopes: {apiKey.scopes.join(", ")}</p>

        <label className="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} data-testid="confirm-copied-key" className="rounded accent-primary" />
          I&apos;ve copied this key
        </label>

        <button onClick={onClose} disabled={!confirmed} data-testid="close-reveal-btn" className="mt-3 w-full rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-40">
          Close
        </button>
      </div>
    </div>
  );
}
