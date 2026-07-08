// src/app/(dashboard)/surveys/builder/page.tsx
// Sprint 10 F4 — Survey Builder Page (new survey)

import React from "react";
import { SurveyBuilder } from "@/features/surveys/components/SurveyBuilder";

export default function SurveyBuilderNewPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <SurveyBuilder />
    </div>
  );
}
