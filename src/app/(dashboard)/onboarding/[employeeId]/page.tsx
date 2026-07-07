// src/app/(dashboard)/onboarding/[employeeId]/page.tsx
// Sprint 8 2.2.F1 — Onboarding Checklist Page

"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { OnboardingProgressHeader } from "@/features/onboarding/components/OnboardingProgressHeader";
import { TaskChecklist } from "@/features/onboarding/components/TaskChecklist";
import { useEmployeeOnboarding, useCompleteTask } from "@/features/onboarding/api";

export default function OnboardingChecklistPage() {
  const params = useParams();
  const employeeId = (params?.employeeId as string) ?? '';
  const user = useAuthStore((s) => s.user);
  const viewerRole = (user?.role ?? 'employee').toLowerCase();

  const { data, isLoading, isError, refetch } = useEmployeeOnboarding(employeeId);
  const completeTask = useCompleteTask();

  const isReadOnly = data?.status === 'completed' || data?.status === 'cancelled';

  function handleComplete(taskId: string) {
    completeTask.mutate(taskId);
  }

  return (
    <div className="space-y-6">
      <OnboardingProgressHeader
        completionPercentage={data?.completionPercentage ?? 0}
        hireDate={data?.hireDate ?? ''}
        status={data?.status ?? 'in_progress'}
        employeeName={data?.employeeName}
        isLoading={isLoading}
      />

      {isError ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm text-muted-foreground">Failed to load onboarding data.</p>
          <button
            onClick={() => refetch()}
            className="text-sm text-primary underline"
            type="button"
          >
            Retry
          </button>
        </div>
      ) : (
        <TaskChecklist
          tasks={data?.tasks ?? []}
          viewerRole={viewerRole}
          isReadOnly={isReadOnly}
          isLoading={isLoading}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
