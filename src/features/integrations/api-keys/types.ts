// src/features/integrations/api-keys/types.ts
// Sprint 12 — API Key Types (mirrors backend DTOs)

export type ApiKeyScope =
  | "employees:read" | "employees:write"
  | "payroll:read" | "payroll:write"
  | "leave:read" | "leave:write"
  | "reports:read" | "reports:write"
  | "webhooks:read" | "webhooks:write";

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;          // e.g., "hrp_live_ab"
  scopes: ApiKeyScope[];
  status: "ACTIVE" | "REVOKED";
  lastUsedAt: string | null;
  createdAt: string;
  revokedAt: string | null;
}

export interface CreateApiKeyDto {
  name: string;
  scopes: ApiKeyScope[];
  expiresAt?: string;
}

export interface ApiKeyCreatedResponse {
  id: string;
  name: string;
  rawKey: string;          // Only returned on creation — never persisted
  prefix: string;
  scopes: ApiKeyScope[];
  expiresAt: string | null;
}
