// src/features/settings/components/TemplateList.tsx
// Sprint 6 1.6.F5-B — Notification template list sidebar

"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { NotificationTemplate } from "@/types/settings.types";

interface TemplateListProps {
  templates: NotificationTemplate[];
  selectedId: string | null;
  isLoading: boolean;
  hasUnsaved: (id: string) => boolean;
  onSelect: (template: NotificationTemplate, channel: string) => void;
}

export function TemplateList({
  templates,
  selectedId,
  isLoading,
  hasUnsaved,
  onSelect,
}: TemplateListProps) {
  const channels = ["email", "sms", "in_app"] as const;

  if (isLoading) {
    return (
      <div className="space-y-2 p-2" data-testid="template-list-loading">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground" data-testid="template-list-empty">
        No templates found.
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2" data-testid="template-list">
      {templates.map((tpl) =>
        channels.map((ch) => (
          <button
            key={`${tpl.id}-${ch}`}
            type="button"
            onClick={() => onSelect(tpl, ch)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
              selectedId === `${tpl.id}-${ch}` && "bg-accent font-medium",
            )}
            data-testid={`template-${tpl.eventKey}-${ch}`}
          >
            {hasUnsaved(`${tpl.id}-${ch}`) && (
              <span className="text-amber-500" title="Unsaved changes">
                •
              </span>
            )}
            <span className="truncate">{tpl.displayName}</span>
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">
              {ch}
            </span>
          </button>
        )),
      )}
    </div>
  );
}
