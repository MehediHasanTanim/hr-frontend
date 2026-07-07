// src/features/performance/components/OkrTreeView.tsx
// Sprint 8 F2 — Collapsible hierarchical OKR tree

"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Target, Gauge, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { GoalProgressBar } from "./GoalProgressBar";
import { CheckInDrawer } from "./CheckInDrawer";
import type { Goal, GoalStatus } from "@/types/performance";

const STATUS_COLORS: Record<GoalStatus, string> = {
  not_started: 'bg-gray-100 text-gray-700',
  on_track: 'bg-green-100 text-green-700',
  at_risk: 'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

interface OkrTreeViewProps {
  goals: Goal[];
  isLoading: boolean;
}

export function OkrTreeView({ goals, isLoading }: OkrTreeViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-3" data-testid="okr-tree-loading">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center" data-testid="okr-tree-empty">
        <Target className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No goals yet for this cycle.</p>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Create your first objective
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1" data-testid="okr-tree">
      {goals.map((goal) => (
        <GoalNode key={goal.id} goal={goal} depth={0} />
      ))}
    </div>
  );
}

function GoalNode({ goal, depth }: { goal: Goal; depth: number }) {
  const [expanded, setExpanded] = useState(true);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const hasChildren = goal.children.length > 0;

  return (
    <div className="space-y-1">
      {/* Node row */}
      <div
        className={cn(
          "flex items-start gap-2 rounded-lg border p-3 transition-colors hover:bg-accent/30",
          depth > 0 && "ml-6",
        )}
        data-testid={`goal-node-${goal.id}`}
      >
        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label={expanded ? 'Collapse' : 'Expand'}
          data-testid={`goal-expand-${goal.id}`}
        >
          {hasChildren ? (
            expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            <span className="block w-4" />
          )}
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {goal.goalType === 'objective' ? 'Objective' : 'Key Result'}
            </Badge>
            <Badge className={cn("text-xs", STATUS_COLORS[goal.status])}>
              {goal.status.replace(/_/g, ' ')}
            </Badge>
            {goal.weight !== null && (
              <span className="text-xs text-muted-foreground">Weight: {goal.weight}</span>
            )}
            <span className="text-sm font-medium">{goal.title}</span>
          </div>

          {goal.description && (
            <p className="text-xs text-muted-foreground">{goal.description}</p>
          )}

          {/* Progress bar (only for goals with numeric targets) */}
          <GoalProgressBar
            currentValue={goal.currentValue}
            targetValue={goal.targetValue}
            unit={goal.unit}
          />

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCheckInOpen(true)}
              data-testid={`goal-checkin-${goal.id}`}
            >
              <Gauge className="mr-1 h-3.5 w-3.5" />
              Check-in
            </Button>
          </div>
        </div>
      </div>

      {/* Children (recursive) */}
      {hasChildren && expanded && (
        <div className="space-y-1">
          {goal.children.map((child) => (
            <GoalNode key={child.id} goal={child} depth={depth + 1} />
          ))}
        </div>
      )}

      {/* Check-in drawer */}
      <CheckInDrawer
        goal={goal}
        open={checkInOpen}
        onClose={() => setCheckInOpen(false)}
      />
    </div>
  );
}
