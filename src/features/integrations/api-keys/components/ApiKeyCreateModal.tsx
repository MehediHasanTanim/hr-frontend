// src/features/integrations/api-keys/components/ApiKeyCreateModal.tsx
"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCreateApiKey } from "../hooks";
import { createApiKeySchema, type CreateApiKeyForm } from "../../schemas";
import type { ApiKeyCreatedResponse } from "../types";

const SCOPE_GROUPS: { label: string; scopes: { value: string; label: string }[] }[] = [
  { label: "Employees", scopes: [{ value: "employees:read", label: "Read" }, { value: "employees:write", label: "Write" }] },
  { label: "Payroll", scopes: [{ value: "payroll:read", label: "Read" }, { value: "payroll:write", label: "Write" }] },
  { label: "Leave", scopes: [{ value: "leave:read", label: "Read" }, { value: "leave:write", label: "Write" }] },
  { label: "Reports", scopes: [{ value: "reports:read", label: "Read" }, { value: "reports:write", label: "Write" }] },
  { label: "Webhooks", scopes: [{ value: "webhooks:read", label: "Read" }, { value: "webhooks:write", label: "Write" }] },
];

interface Props { onClose: () => void; onCreated: (resp: ApiKeyCreatedResponse) => void; }

export function ApiKeyCreateModal({ onClose, onCreated }: Props) {
  const mutation = useCreateApiKey();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateApiKeyForm>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: { name: "", scopes: [] },
  });

  const onSubmit = (data: CreateApiKeyForm) => {
    mutation.mutate(data, { onSuccess: (resp) => onCreated(resp) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-lg bg-background p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create API Key</h3>
          <button onClick={onClose} className="rounded p-1 hover:text-foreground" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input {...register("name")} data-testid="api-key-name" placeholder="e.g. Production API Key" />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <fieldset>
            <legend className="block text-sm font-medium mb-2">Scopes</legend>
            <div data-testid="scope-selector" className="space-y-2">
              {SCOPE_GROUPS.map((group) => (
                <div key={group.label} className="flex items-center gap-3 rounded-md border p-2">
                  <span className="text-xs font-medium w-20 shrink-0">{group.label}</span>
                  {group.scopes.map((scope) => (
                    <label key={scope.value} className="flex items-center gap-1 text-xs">
                      <input type="checkbox" value={scope.value} {...register("scopes")} data-testid={`scope-${scope.value}`} className="rounded accent-primary" />
                      {scope.label}
                    </label>
                  ))}
                </div>
              ))}
            </div>
            {errors.scopes && <p className="mt-1 text-xs text-destructive">{errors.scopes.message}</p>}
          </fieldset>
          <div>
            <label className="block text-sm font-medium mb-1">Expires (optional)</label>
            <Input type="datetime-local" {...register("expiresAt")} data-testid="api-key-expires" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
            <button type="submit" data-testid="submit-api-key" disabled={mutation.isPending} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Key"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
