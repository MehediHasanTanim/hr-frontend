// src/app/(dashboard)/lms/my-training/page.tsx
// Sprint 9 2.3.F5 — My Training Page (ESS)

"use client";

import React from "react";
import { MyTrainingPage as MyTrainingView } from "@/features/lms/my-training/components/MyTrainingPage";

export default function MyTrainingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Training</h1>
        <p className="text-sm text-muted-foreground">Your courses, certifications, and progress</p>
      </div>
      <MyTrainingView />
    </div>
  );
}
