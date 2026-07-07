// src/features/lms/my-training/components/MyTrainingPage.tsx
// Sprint 9 F5 — My Training (ESS): enrollments + certifications overview

"use client";

import React from "react";
import { useMyTrainingQuery } from "../api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "./ProgressBar";
import { OverdueAlertBanner } from "./OverdueAlertBanner";
import { CertExpiryCountdown } from "./CertExpiryCountdown";
import { BookOpen, Award, RefreshCw, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MyTrainingItem, MyCertification } from "@/types/lms";

export function MyTrainingPage() {
  const { data, isLoading, isError, refetch } = useMyTrainingQuery();
  const enrollments = data?.enrollments ?? [];
  const certifications = data?.certifications ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="my-training-loading">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-sm text-muted-foreground">Failed to load training data.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  const overdue = enrollments.filter((e) => e.isOverdue);
  const inProgress = enrollments.filter((e) => e.status === 'in_progress' && !e.isOverdue);
  const upcoming = enrollments.filter((e) => e.status === 'not_started');

  return (
    <div className="space-y-8" data-testid="my-training">
      {/* Overdue banner */}
      {overdue.length > 0 && <OverdueAlertBanner items={overdue} />}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <Award className="h-5 w-5" /> Certifications
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((cert) => (
              <CertExpiryCountdown key={cert.id} cert={cert} />
            ))}
          </div>
        </section>
      )}

      {/* In Progress */}
      <section>
        <h3 className="mb-3 text-base font-semibold">In Progress ({inProgress.length})</h3>
        {inProgress.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No courses in progress.</p>
        ) : (
          <div className="space-y-3">
            {inProgress.map((item) => (
              <EnrollmentRow key={item.enrollmentId} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming */}
      <section>
        <h3 className="mb-3 text-base font-semibold">Upcoming ({upcoming.length})</h3>
        {upcoming.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No upcoming courses.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((item) => (
              <EnrollmentRow key={item.enrollmentId} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EnrollmentRow({ item }: { item: MyTrainingItem }) {
  function getDeadlineLabel() {
    if (!item.deadlineAt) return null;
    const days = Math.ceil((new Date(item.deadlineAt).getTime() - Date.now()) / 86400000);
    if (days < 0) return { text: `Overdue by ${Math.abs(days)} days`, color: 'text-red-600' };
    if (days <= 7) return { text: `Due in ${days} days`, color: 'text-red-600' };
    if (days <= 30) return { text: `Due in ${days} days`, color: 'text-amber-600' };
    return { text: `Due in ${days} days`, color: 'text-muted-foreground' };
  }

  const deadlineLabel = getDeadlineLabel();

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3" data-testid={`training-item-${item.enrollmentId}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{item.courseTitle}</span>
          {item.isMandatory && <Badge variant="destructive" className="text-xs">Mandatory</Badge>}
          {item.isOverdue && (
            <span className="flex items-center gap-1 text-xs text-red-600">
              <AlertTriangle className="h-3 w-3" /> Overdue
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-4">
          <ProgressBar value={item.progressPercent} className="flex-1" />
          <span className="text-xs tabular-nums text-muted-foreground">{item.progressPercent}%</span>
        </div>
        {deadlineLabel && (
          <p className={cn("mt-1 text-xs", deadlineLabel.color)}>{deadlineLabel.text}</p>
        )}
      </div>
      <Button size="sm" variant="outline">
        {item.status === 'completed' ? <CheckCircle2 className="mr-1 h-4 w-4" /> : <Clock className="mr-1 h-4 w-4" />}
        {item.status === 'completed' ? 'Done' : 'Continue'}
      </Button>
    </div>
  );
}
