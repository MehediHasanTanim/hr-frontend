// src/app/(dashboard)/compensation/bonus/[cycleId]/page.tsx
// Sprint 10 F3 — Bonus Cycle Manager Page

"use client";

import React from "react";
import { useParams } from "next/navigation";
import { BonusAllocationTable } from "@/features/compensation/components/BonusAllocationTable";

export default function BonusCyclePage() {
  const params = useParams<{ cycleId: string }>();
  const cycleId = params?.cycleId ?? "";

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Bonus Cycle Manager</h1>
      {cycleId ? (
        <BonusAllocationTable cycleId={cycleId} />
      ) : (
        <p className="text-sm text-muted-foreground">No cycle selected.</p>
      )}
    </div>
  );
}
