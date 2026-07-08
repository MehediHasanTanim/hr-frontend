// src/features/offboarding/components/ChecklistTaskList.tsx
// Sprint 11 F4 — Offboarding checklist with category grouping + Complete/Skip actions

"use client";
import React, { useState } from "react";
import { Loader2, Check, SkipForward } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useChecklistTasks, useCompleteChecklistTask, useSkipChecklistTask } from "@/features/offboarding/hooks/useChecklistTasks";
import { useOffboardingUiStore } from "@/features/offboarding/store/offboardingUiStore";
import { cn } from "@/lib/utils";
import type { OffboardingChecklistTask, ChecklistTaskCategory } from "@/features/offboarding/types/offboarding";

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "Pending", variant: "outline" },
  IN_PROGRESS: { label: "In Progress", variant: "secondary" },
  COMPLETED: { label: "Completed", variant: "default" },
  SKIPPED: { label: "Skipped", variant: "destructive" },
};

function ChecklistTaskRow({ task, exitRequestId }: { task: OffboardingChecklistTask; exitRequestId: string }) {
  const completeMutation = useCompleteChecklistTask();
  const skipMutation = useSkipChecklistTask();
  const [showNotes, setShowNotes] = useState<"complete" | "skip" | null>(null);
  const [notes, setNotes] = useState("");

  const isActionable = task.status === "PENDING" || task.status === "IN_PROGRESS";
  const badge = STATUS_BADGE[task.status] ?? { label: task.status, variant: "outline" as const };

  const handleComplete = () => {
    completeMutation.mutate({ taskId: task.id, exitRequestId, notes: notes || undefined }, {
      onSuccess: () => { setShowNotes(null); setNotes(""); },
    });
  };

  const handleSkip = () => {
    if (!notes.trim()) return;
    skipMutation.mutate({ taskId: task.id, exitRequestId, notes: notes.trim() }, {
      onSuccess: () => { setShowNotes(null); setNotes(""); },
    });
  };

  return (
    <div data-testid={`checklist-task-${task.id}`} className="flex items-center justify-between rounded-md border p-3">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{task.taskName}</p>
        <div className="flex items-center gap-2">
          <Badge variant={badge.variant}>{badge.label}</Badge>
          {task.assignedToId && <span className="text-xs text-muted-foreground">Assignee: {task.assignedToId}</span>}
        </div>
      </div>

      {isActionable && (
        <div className="flex items-center gap-2">
          {showNotes === "complete" ? (
            <div className="flex items-center gap-1">
              <Input data-testid={`complete-notes-${task.id}`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" className="h-7 w-32 text-xs" />
              <button onClick={handleComplete} disabled={completeMutation.isPending} className="rounded bg-green-600 px-2 py-1 text-xs text-white">OK</button>
              <button onClick={() => setShowNotes(null)} className="text-xs text-muted-foreground">Cancel</button>
            </div>
          ) : showNotes === "skip" ? (
            <div className="flex items-center gap-1">
              <Input data-testid={`skip-notes-${task.id}`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reason (required)" className="h-7 w-40 text-xs" />
              <button onClick={handleSkip} disabled={!notes.trim() || skipMutation.isPending} className="rounded bg-destructive px-2 py-1 text-xs text-white">Skip</button>
              <button onClick={() => setShowNotes(null)} className="text-xs text-muted-foreground">Cancel</button>
            </div>
          ) : (
            <>
              <button onClick={() => setShowNotes("complete")} className="inline-flex items-center gap-1 rounded bg-green-600 px-2 py-1 text-xs text-white" data-testid={`complete-btn-${task.id}`}><Check className="h-3 w-3" /> Complete</button>
              <button onClick={() => setShowNotes("skip")} className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs" data-testid={`skip-btn-${task.id}`}><SkipForward className="h-3 w-3" /> Skip</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface Props { exitRequestId: string; }

export function ChecklistTaskList({ exitRequestId }: Props) {
  const { data, isLoading, isError } = useChecklistTasks(exitRequestId);
  const { activeChecklistFilter, setActiveChecklistFilter } = useOffboardingUiStore();

  if (isLoading) return <div className="flex py-8 justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (isError) return <div className="py-8 text-center text-sm text-destructive">Unable to load checklist.</div>;

  const tasks = data ?? [];
  const completed = tasks.filter((t) => t.status === "COMPLETED" || t.status === "SKIPPED").length;

  const grouped = tasks.reduce((acc, t) => {
    const cat = t.category as ChecklistTaskCategory;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {} as Record<string, OffboardingChecklistTask[]>);

  const categories: ChecklistTaskCategory[] = ["IT", "FINANCE", "HR", "FACILITIES", "MANAGER"];
  const filteredCats = activeChecklistFilter === "ALL" ? categories : [activeChecklistFilter];

  return (
    <div data-testid="checklist-task-list" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Offboarding Checklist ({completed}/{tasks.length})
        </h3>
        <div className="flex rounded-md border text-xs">
          <button onClick={() => setActiveChecklistFilter("ALL")} className={cn("px-2 py-1", activeChecklistFilter === "ALL" && "bg-primary text-primary-foreground")}>All</button>
          {categories.map((c) => (
            <button key={c} onClick={() => setActiveChecklistFilter(c)} className={cn("px-2 py-1", activeChecklistFilter === c && "bg-primary text-primary-foreground")}>{c}</button>
          ))}
        </div>
      </div>

      <div className="h-2 w-full rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${tasks.length > 0 ? (completed / tasks.length) * 100 : 0}%` }} />
      </div>

      {filteredCats.map((cat) => {
        const catTasks = grouped[cat] ?? [];
        if (catTasks.length === 0) return null;
        return (
          <div key={cat} className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">{cat}</h4>
            {catTasks.map((t) => (
              <ChecklistTaskRow key={t.id} task={t} exitRequestId={exitRequestId} />
            ))}
          </div>
        );
      })}

      {tasks.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No checklist tasks yet.</p>}
    </div>
  );
}
