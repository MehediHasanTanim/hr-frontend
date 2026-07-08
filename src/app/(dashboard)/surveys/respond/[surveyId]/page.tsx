// src/app/(dashboard)/surveys/respond/[surveyId]/page.tsx
// Sprint 10 F5 — Survey Response Page

"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SurveyResponseForm } from "@/features/surveys/components/SurveyResponseForm";
import { useSurveyDraftQuery } from "@/features/surveys/hooks/useSurveyDraftQuery";

export default function SurveyRespondPage() {
  const params = useParams<{ surveyId: string }>();
  const { data: survey, isLoading, isError } = useSurveyDraftQuery(
    params?.surveyId ?? "",
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !survey) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Unable to load this survey.
        </div>
      </div>
    );
  }

  if (survey.status === "CLOSED") {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8 text-center">
        <h2 className="text-xl font-semibold">{survey.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This survey is closed and no longer accepting responses.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SurveyResponseForm
        surveyId={survey.id}
        title={survey.title}
        description={survey.description}
        questions={survey.questions}
      />
    </div>
  );
}
