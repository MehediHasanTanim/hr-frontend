// src/features/recruitment/kanban/components/KanbanBoard.tsx
// Sprint 7 F1 — Kanban Pipeline Board
// Per-requisition drag-and-drop board: columns = ApplicationStage, cards = Applications
// Uses @dnd-kit/core + @dnd-kit/sortable for accessible keyboard-operable DnD

"use client";

import React, { useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { ArchivedPanel } from "./ArchivedPanel";
import { useApplications, useMoveApplicationStage } from "../../applications/api";
import { useKanbanUiStore } from "../store";
import type { Application, ApplicationStage } from "@/types/recruitment";
import { STAGE_ORDER, TERMINAL_STAGES } from "@/types/recruitment";

interface KanbanBoardProps {
  requisitionId: string;
}

export function KanbanBoard({ requisitionId }: KanbanBoardProps) {
  // ─── Data ──────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useApplications({
    requisitionId,
    limit: 200,
  });
  const moveStage = useMoveApplicationStage();

  // ─── UI store ──────────────────────────────────────────────────
  const {
    draggingCardId,
    setDragging,
    clearDragging,
    isArchivedExpanded,
    toggleArchived,
    rejectModal,
    openRejectModal,
    closeRejectModal,
  } = useKanbanUiStore();

  // ─── Group applications by stage ───────────────────────────────
  const { activeApps, archivedApps, applicationsById } = useMemo(() => {
    const allApps: Application[] = data?.data ?? [];
    const byId: Record<string, Application> = {};
    const active: Record<ApplicationStage, Application[]> = {} as Record<ApplicationStage, Application[]>;
    const archived: Application[] = [];

    for (const stage of [...STAGE_ORDER, ...TERMINAL_STAGES]) {
      active[stage] = [];
    }

    for (const app of allApps) {
      byId[app.id] = app;
      if (TERMINAL_STAGES.includes(app.stage)) {
        archived.push(app);
      } else if (active[app.stage]) {
        active[app.stage]!.push(app);
      }
    }

    return { activeApps: active, archivedApps: archived, applicationsById: byId };
  }, [data]);

  // ─── DnD sensors (pointer + keyboard) ──────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // ─── DnD handlers ──────────────────────────────────────────────
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const appId = event.active.id as string;
      const app = applicationsById[appId];
      if (app) {
        setDragging(appId, app.stage);
      }
    },
    [applicationsById, setDragging],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      clearDragging();

      if (!over) return; // dropped outside any droppable

      const appId = active.id as string;
      const targetStage = over.id as ApplicationStage;
      const app = applicationsById[appId];

      if (!app) return;
      if (app.stage === targetStage) return; // no-op
      if (TERMINAL_STAGES.includes(targetStage)) return; // cannot drop into terminal stages

      // Fire optimistic mutation
      moveStage.mutate({ id: appId, stage: targetStage });
    },
    [applicationsById, clearDragging, moveStage],
  );

  // ─── Handlers ──────────────────────────────────────────────────
  function handleReject(app: Application) {
    const name = app.candidate
      ? `${app.candidate.firstName} ${app.candidate.lastName}`
      : 'Unknown';
    openRejectModal(app.id, name);
  }

  function handleView(app: Application) {
    // Navigate to application detail — placeholder for now
    // TODO: wire up to application detail route when available
    console.info('View application:', app.id);
  }

  // ─── Loading state ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="kanban-loading">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-[280px] shrink-0 space-y-3">
              <Skeleton className="h-6 w-24" />
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-24 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Error state ───────────────────────────────────────────────
  if (isError) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-16 text-center"
        data-testid="kanban-error"
      >
        <p className="text-sm text-muted-foreground">Failed to load applications.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────
  const draggingApp = draggingCardId ? applicationsById[draggingCardId] : null;

  return (
    <div data-testid="kanban-board">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Board columns */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGE_ORDER.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              applications={activeApps[stage] ?? []}
              count={(activeApps[stage] ?? []).length}
              onReject={handleReject}
              onView={handleView}
            />
          ))}
        </div>

        {/* Drag overlay — renders the card being dragged */}
        <DragOverlay>
          {draggingApp ? (
            <div className="w-[280px] rotate-2 opacity-90">
              <KanbanCard
                application={draggingApp}
                isDragDisabled={false}
                onReject={() => {}}
                onView={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Archived (terminal) panel */}
      <ArchivedPanel
        applications={archivedApps}
        isExpanded={isArchivedExpanded}
        onToggle={toggleArchived}
        onView={handleView}
      />
    </div>
  );
}
