// src/features/integrations/__tests__/integrations.regression.test.tsx
// Sprint 12 — Integrations Unit Tests (Vitest + RTL)

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiKeyRevealOnce } from "@/features/integrations/api-keys/components/ApiKeyRevealOnce";
import { createApiKeySchema, registerWebhookSchema } from "@/features/integrations/schemas";

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// ─── ApiKeyRevealOnce — security-critical ──────────────────────
describe("ApiKeyRevealOnce", () => {
  const apiKey = {
    id: "k1", name: "Test Key",
    rawKey: "hrp_live_secret123456789abcdef",
    prefix: "hrp_live_se", scopes: ["employees:read"], expiresAt: null,
  };

  it("displays the raw key", () => {
    render(<ApiKeyRevealOnce apiKey={apiKey} onClose={vi.fn()} />, { wrapper: Wrapper });
    expect(screen.getByTestId("revealed-api-key")).toBeDefined();
    expect(screen.getByText(/hrp_live_secret/)).toBeDefined();
  });

  it("shows warning that key will not be shown again", () => {
    render(<ApiKeyRevealOnce apiKey={apiKey} onClose={vi.fn()} />, { wrapper: Wrapper });
    expect(screen.getByText(/will not be shown again/)).toBeDefined();
  });

  it("close button is disabled until confirmed", () => {
    render(<ApiKeyRevealOnce apiKey={apiKey} onClose={vi.fn()} />, { wrapper: Wrapper });
    expect(screen.getByTestId("close-reveal-btn")).toBeDisabled();
  });

  it("close button enables after confirmation checkbox checked", async () => {
    render(<ApiKeyRevealOnce apiKey={apiKey} onClose={vi.fn()} />, { wrapper: Wrapper });
    await userEvent.click(screen.getByTestId("confirm-copied-key"));
    expect(screen.getByTestId("close-reveal-btn")).not.toBeDisabled();
  });

  it("calls onClose when close button clicked after confirmation", async () => {
    const onClose = vi.fn();
    render(<ApiKeyRevealOnce apiKey={apiKey} onClose={onClose} />, { wrapper: Wrapper });
    await userEvent.click(screen.getByTestId("confirm-copied-key"));
    await userEvent.click(screen.getByTestId("close-reveal-btn"));
    expect(onClose).toHaveBeenCalled();
  });
});

// ─── Zod Schemas ────────────────────────────────────────────────
describe("integration schemas", () => {
  it("createApiKeySchema requires at least one scope", () => {
    const result = createApiKeySchema.safeParse({ name: "Test", scopes: [] });
    expect(result.success).toBe(false);
  });

  it("createApiKeySchema accepts valid payload", () => {
    const result = createApiKeySchema.safeParse({ name: "Prod Key", scopes: ["employees:read", "payroll:write"] });
    expect(result.success).toBe(true);
  });

  it("createApiKeySchema rejects empty name", () => {
    const result = createApiKeySchema.safeParse({ name: "", scopes: ["employees:read"] });
    expect(result.success).toBe(false);
  });

  it("registerWebhookSchema rejects non-HTTPS URLs", () => {
    const result = registerWebhookSchema.safeParse({
      url: "http://example.com/webhook",
      subscribedEvents: ["employee.created"],
    });
    expect(result.success).toBe(false);
  });

  it("registerWebhookSchema accepts valid HTTPS URL", () => {
    const result = registerWebhookSchema.safeParse({
      url: "https://example.com/webhook",
      subscribedEvents: ["employee.created", "leave.approved"],
    });
    expect(result.success).toBe(true);
  });

  it("registerWebhookSchema requires at least one event", () => {
    const result = registerWebhookSchema.safeParse({
      url: "https://example.com/webhook",
      subscribedEvents: [],
    });
    expect(result.success).toBe(false);
  });

  it("registerWebhookSchema rejects invalid URL format", () => {
    const result = registerWebhookSchema.safeParse({
      url: "not-a-url",
      subscribedEvents: ["employee.created"],
    });
    expect(result.success).toBe(false);
  });
});
