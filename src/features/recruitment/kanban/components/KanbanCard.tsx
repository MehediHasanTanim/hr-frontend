// src/features/recruitment/kanban/components/KanbanCard.tsx
// Sprint 7 F1 — Draggable application card for the kanban pipeline

"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, MoreHorizontal, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Application } from "@/types/recruitment";
import { STAGE_LABELS, STAGE_COLORS } from "@/types/recruitment";

// ─── Inlined CSS Transform for @dnd-kit (avoids extra dependency) ──
function dndTransform(
  transform: { x: number; y: number; scaleX: number; scaleY: number } | null,
): string | undefined {
  if (!transform) return undefined;
  const { x, y, scaleX, scaleY } = transform;
  return `translate3d(${x}px, ${y}px, 0) scaleX(${scaleX}) scaleY(${scaleY})`;
}

interface KanbanCardProps {
  application: Application;
  isDragDisabled: boolean;
  onReject: (app: Application) => void;
  onView: (app: Application) => void;
}

export function KanbanCard({ application, isDragDisabled, onReject, onView }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: application.id,
    disabled: isDragDisabled,
    data: { application, stage: application.stage },
  });

  const style: React.CSSProperties = {
    transform: dndTransform(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const candidateName = application.candidate
    ? `${application.candidate.firstName} ${application.candidate.lastName}`
    : 'Unknown Candidate';

  const candidateEmail = application.candidate?.email ?? '—';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
        isDragging && "shadow-lg ring-2 ring-primary",
        STAGE_COLORS[application.stage],
      )}
      data-testid={`kanban-card-${application.id}`}
      role="listitem"
      aria-label={`${candidateName} — ${STAGE_LABELS[application.stage]}`}
    >
      {/* Drag handle */}
      {!isDragDisabled && (
        <button
          {...attributes}
          {...listeners}
          className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab p-1 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          aria-label={`Drag ${candidateName}`}
          data-testid={`card-drag-handle-${application.id}`}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      )}

      <div className={cn(!isDragDisabled && "ml-5")}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{candidateName}</p>
            <p className="truncate text-xs text-muted-foreground">{candidateEmail}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted"
                aria-label={`Actions for ${candidateName}`}
                data-testid={`card-menu-${application.id}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(application)}>
                View Details
              </DropdownMenuItem>
              {application.stage !== 'rejected' && application.stage !== 'withdrawn' && (
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => onReject(application)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Score */}
        {application.currentScore !== undefined && application.currentScore !== null && (
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Score: {application.currentScore.toFixed(1)}
            </Badge>
          </div>
        )}

        {/* Applied date */}
        <p className="mt-2 text-xs text-muted-foreground">
          Applied: {new Date(application.appliedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
      </div>
    </div>
  );
}
