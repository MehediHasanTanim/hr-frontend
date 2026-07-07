// src/app/(dashboard)/recruitment/requisitions/[id]/pipeline/page.tsx
// Sprint 7 2.1.F1 — Kanban Pipeline Board page

"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/features/recruitment/kanban/components/KanbanBoard";
import { RejectModal } from "@/features/recruitment/kanban/components/RejectModal";
import { useRequisition } from "@/features/recruitment/requisitions/api";
import { useKanbanUiStore } from "@/features/recruitment/kanban/store";
import { Skeleton } from "@/components/ui/skeleton";

export default function PipelinePage() {
  const params = useParams();
  const requisitionId = params?.id as string;

  const { data: requisition, isLoading } = useRequisition(requisitionId);
  const { rejectModal, closeRejectModal } = useKanbanUiStore();

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/recruitment/requisitions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isLoading ? (
                <Skeleton className="h-7 w-64" />
              ) : (
                requisition?.title ?? 'Pipeline'
              )}
            </h1>
            {requisition && (
              <p className="text-sm text-muted-foreground">
                {requisition.department?.name} · {requisition.location} ·{' '}
                {requisition.positionsFilled}/{requisition.positionsRequested} filled
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Kanban Board ────────────────────────────────────────────── */}
      {requisitionId && <KanbanBoard requisitionId={requisitionId} />}
    </div>
  );
}
