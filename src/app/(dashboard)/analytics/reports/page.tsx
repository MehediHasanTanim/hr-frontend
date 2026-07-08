// src/app/(dashboard)/analytics/reports/page.tsx
// Sprint 11 F2 — Custom Report Builder + Saved Reports

"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { SavedReportsList } from "@/features/analytics/components/ReportBuilder/SavedReportsList";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"saved" | "builder">("saved");

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <div className="flex gap-1 border-b mb-6">
        {(["saved", "builder"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab === "saved" ? "Saved Reports" : "Build Report"}
          </button>
        ))}
      </div>
      {activeTab === "saved" ? (
        <SavedReportsList onEdit={(id) => { /* navigate to builder with id */ }} />
      ) : (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Report builder coming soon. Use saved reports for now.
        </div>
      )}
    </div>
  );
}
