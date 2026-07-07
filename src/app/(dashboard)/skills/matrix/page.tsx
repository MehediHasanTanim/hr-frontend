// src/app/(dashboard)/skills/matrix/page.tsx
// Sprint 9 2.3.F4 — Skills Matrix Page

"use client";

import React from "react";
import { SkillsMatrixHeatmap } from "@/features/skills/matrix/components/SkillsMatrixHeatmap";

export default function SkillsMatrixPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Skills Matrix</h1>
        <p className="text-sm text-muted-foreground">Department-wide skill proficiency overview</p>
      </div>
      <SkillsMatrixHeatmap />
    </div>
  );
}
