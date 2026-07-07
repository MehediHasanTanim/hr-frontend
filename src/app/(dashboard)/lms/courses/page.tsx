// src/app/(dashboard)/lms/courses/page.tsx
// Sprint 9 2.3.F1 — Course Catalog Page

"use client";

import React, { Suspense } from "react";
import { CourseCatalogGrid } from "@/features/lms/courses/components/CourseCatalogGrid";

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Course Catalog</h1>
        <p className="text-sm text-muted-foreground">Browse and enroll in courses</p>
      </div>
      <Suspense>
        <CourseCatalogGrid />
      </Suspense>
    </div>
  );
}
