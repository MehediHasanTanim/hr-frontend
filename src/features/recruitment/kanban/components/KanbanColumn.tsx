// src/features/recruitment/kanban/components/KanbanColumn.tsx
// Sprint 7 F1 — Kanban column (droppable stage column)

"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { KanbanCard } from "./KanbanCard";
import type { Application, ApplicationStage } from "@/types/recruitment";
import { STAGE_LABELS, DRAG_DISABLED_STAGES } from "@/types/recruitment";

interface KanbanColumnProps {
  stage: ApplicationStage;
  applications: Application[];
  count: number;
  onReject: (app: Application) => void;
  onView: (app: Application) => void;
}

export function KanbanColumn({
  stage,
  applications,
  count,
  onReject,
  onView,
}: KanbanColumnProps) {
  const isDragDisabled = DRAG_DISABLED_STAGES.includes(stage);
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    disabled: isDragDisabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[200px] w-[280px] shrink-0 flex-col rounded-xl border bg-muted/30 p-3 transition-colors",
        isOver && !isDragDisabled && "bg-primary/5 ring-2 ring-primary",
        isDragDisabled && "opacity-60",
      )}
      data-testid={`kanban-column-${stage}`}
    >
      {/* Column header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{STAGE_LABELS[stage]}</h3>
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        </div>
        {isDragDisabled && (
          <span
            className="flex items-center gap-1 text-xs text-muted-foreground"
            title="Hire happens via Offer flow — cards cannot be dragged into this column"
          >
            <Lock className="h-3 w-3" />
          </span>
        )}
      </div>

      {/* Cards */}
      <SortableContext
        items={applications.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2" role="list">
          {applications.map((app) => (
            <KanbanCard
              key={app.id}
              application={app}
              isDragDisabled={isDragDisabled}
              onReject={onReject}
              onView={onView}
            />
          ))}
          {applications.length === 0 && (
            <div className="flex flex-1 items-center justify-center py-8">
              <p className="text-xs text-muted-foreground">
                {isDragDisabled
                  ? 'Hire via Offer flow'
                  : 'No applications'}
              </p>
            </div>
          )}
        </div>
      </SortableContext>

      {/* Drag hint for Offer column */}
      {stage === 'offer' && (
        <p className="mt-2 text-xs text-muted-foreground">
          Drag disabled beyond this point — hire happens via Offer acceptance.
        </p>
      )}
    </div>
  );
}
