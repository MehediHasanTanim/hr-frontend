// src/features/lms/my-training/components/OverdueAlertBanner.tsx
// Sprint 9 F5 — Overdue mandatory training alert banner

"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { MyTrainingItem } from "@/types/lms";

interface OverdueAlertBannerProps {
  items: MyTrainingItem[];
}

export function OverdueAlertBanner({ items }: OverdueAlertBannerProps) {
  if (items.length === 0) return null;

  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30"
      role="alert"
      data-testid="overdue-banner"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <div>
          <p className="font-semibold text-red-800 dark:text-red-200">
            {items.length} overdue {items.length === 1 ? 'course' : 'courses'}
          </p>
          <ul className="mt-2 space-y-1">
            {items.map((item) => (
              <li key={item.enrollmentId}>
                <Link
                  href={`/lms/player/${item.enrollmentId}`}
                  className="text-sm text-red-600 underline hover:text-red-800"
                >
                  {item.courseTitle}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
