// src/app/(dashboard)/analytics/attrition-risk/page.tsx
// Sprint 11 F3 — Attrition Risk Table

import React from "react";
import { AttritionRiskTable } from "@/features/analytics/components/AttritionRiskTable/AttritionRiskTable";

export default function AttritionRiskPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Attrition Risk Analysis</h1>
      <AttritionRiskTable />
    </div>
  );
}
