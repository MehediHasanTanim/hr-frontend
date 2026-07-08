// src/app/(dashboard)/surveys/builder/[surveyId]/page.tsx
// Sprint 10 F4 — Survey Builder Edit Page

"use client";

import React from "react";
import { useParams } from "next/navigation";
import { SurveyBuilder } from "@/features/surveys/components/SurveyBuilder";

export default function SurveyBuilderEditPage() {
  const params = useParams<{ surveyId: string }>();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <SurveyBuilder surveyId={params?.surveyId} />
    </div>
  );
}
