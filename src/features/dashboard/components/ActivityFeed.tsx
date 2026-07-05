// src/features/dashboard/components/ActivityFeed.tsx
// Sprint 6 — Dashboard activity feed from audit logs (HR_ADMIN only)

"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { FileText, LogIn, Settings, UserCheck, UserPlus, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AuditLogEntry {
  id: string;
  action: string;
  actorName: string;
  actorRole?: string;
  description: string;
  entityType?: string;
  createdAt: string;
}

interface ActivityFeedProps {
  entries: AuditLogEntry[];
  isLoading: boolean;
}

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  LOGIN_SUCCESS: LogIn,
  LOGIN_FAILED: AlertTriangle,
  USER_CREATED: UserPlus,
  USER_UPDATED: UserCheck,
  ROLE_UPDATED: Settings,
  default: FileText,
};

function getActionIcon(action: string): React.ComponentType<{ className?: string }> {
  return actionIcons[action] ?? actionIcons.default;
}

function getActionColor(action: string): string {
  if (action.includes("FAILED") || action.includes("REJECTED")) return "text-red-500";
  if (action.includes("CREATED") || action.includes("APPROVED") || action.includes("SUCCESS"))
    return "text-green-500";
  if (action.includes("UPDATED")) return "text-blue-500";
  return "text-muted-foreground";
}

export function ActivityFeed({ entries, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-3" data-testid="activity-feed-loading">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="activity-feed-empty">
        No recent activity to show.
      </p>
    );
  }

  return (
    <ul className="space-y-3" data-testid="activity-feed">
      {entries.slice(0, 10).map((entry) => {
        const Icon = getActionIcon(entry.action);
        const iconColor = getActionColor(entry.action);

        return (
          <li key={entry.id} className="flex items-start gap-3 text-sm">
            <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconColor)} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{entry.actorName}</p>
              <p className="truncate text-muted-foreground">{entry.description}</p>
              <p className="text-xs text-muted-foreground/70">
                {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
