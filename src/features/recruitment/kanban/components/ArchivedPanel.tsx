// src/features/recruitment/kanban/components/ArchivedPanel.tsx
// Sprint 7 F1 — Collapsible panel for terminal-stage applications (rejected/withdrawn)

"use client";

import React from "react";
import { ChevronDown, ChevronRight, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Application } from "@/types/recruitment";
import { STAGE_LABELS } from "@/types/recruitment";

interface ArchivedPanelProps {
  applications: Application[];
  isExpanded: boolean;
  onToggle: () => void;
  onView: (app: Application) => void;
}

export function ArchivedPanel({
  applications,
  isExpanded,
  onToggle,
  onView,
}: ArchivedPanelProps) {
  if (applications.length === 0) return null;

  const rejectedCount = applications.filter((a) => a.stage === 'rejected').length;
  const withdrawnCount = applications.filter((a) => a.stage === 'withdrawn').length;

  return (
    <div className="mt-4 rounded-xl border bg-muted/20" data-testid="archived-panel">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted/50"
        aria-expanded={isExpanded}
        data-testid="archived-toggle"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <Archive className="h-4 w-4 text-muted-foreground" />
        <span>Archived</span>
        {rejectedCount > 0 && (
          <Badge variant="outline" className="text-xs">
            {rejectedCount} rejected
          </Badge>
        )}
        {withdrawnCount > 0 && (
          <Badge variant="outline" className="text-xs">
            {withdrawnCount} withdrawn
          </Badge>
        )}
      </button>

      {isExpanded && (
        <div className="border-t px-4 py-3">
          {applications.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No archived applications.
            </p>
          ) : (
            <div className="space-y-2">
              {applications.map((app) => {
                const name = app.candidate
                  ? `${app.candidate.firstName} ${app.candidate.lastName}`
                  : 'Unknown';
                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-lg border bg-card px-3 py-2"
                    data-testid={`archived-card-${app.id}`}
                  >
                    <div>
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        {STAGE_LABELS[app.stage]}
                        {app.rejectionReason && ` — ${app.rejectionReason}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(app)}
                      data-testid={`archived-view-${app.id}`}
                    >
                      View
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
