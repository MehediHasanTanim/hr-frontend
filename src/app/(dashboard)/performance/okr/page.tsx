// src/app/(dashboard)/performance/okr/page.tsx
// Sprint 8 2.2.F2 — OKR Tree View Page

"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { OkrTreeView } from "@/features/performance/components/OkrTreeView";
import { useOkrTree } from "@/features/performance/api/okr";

export default function OkrPage() {
  const searchParams = useSearchParams();
  const employeeId = searchParams?.get('employeeId') ?? '';
  const cycleId = searchParams?.get('cycleId') ?? undefined;

  const { data: goals, isLoading, isError, refetch } = useOkrTree(employeeId, cycleId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">OKR Tree</h1>
        <p className="text-sm text-muted-foreground">Objectives and Key Results</p>
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm text-muted-foreground">Failed to load OKR tree.</p>
          <button onClick={() => refetch()} className="text-sm text-primary underline" type="button">
            Retry
          </button>
        </div>
      ) : (
        <OkrTreeView goals={goals ?? []} isLoading={isLoading} />
      )}
    </div>
  );
}
