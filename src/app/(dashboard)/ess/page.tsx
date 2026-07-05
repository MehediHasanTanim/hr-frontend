// src/app/(dashboard)/ess/page.tsx
// Sprint 6 1.6.F3 — ESS Home Page (Employee Self-Service)

"use client";

import React from "react";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useMe } from "@/features/ess/hooks/useMe";
import { LeaveBalanceWidget } from "@/features/ess/components/LeaveBalanceWidget";
import { UpcomingLeaveWidget } from "@/features/ess/components/UpcomingLeaveWidget";
import { PayslipWidget } from "@/features/ess/components/PayslipWidget";
import { PendingAcknowledgementsWidget } from "@/features/ess/components/PendingAcknowledgementsWidget";
import { MyDocumentsWidget } from "@/features/ess/components/MyDocumentsWidget";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function EssPage() {
  const user = useAuthStore((s) => s.user);
  const { data: meData, isLoading: meLoading } = useMe();
  const today = format(new Date(), "EEEE, dd MMMM yyyy");

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        {meLoading ? (
          <Skeleton className="h-7 w-64" />
        ) : (
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {meData?.name ?? user?.name}
          </h1>
        )}
        <p className="text-sm text-muted-foreground">{today}</p>
      </div>

      {/* ─── Widgets Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <LeaveBalanceWidget
          balances={meData?.leaveBalances ?? []}
          isLoading={meLoading}
        />
        <UpcomingLeaveWidget />
        <PayslipWidget />
        <PendingAcknowledgementsWidget
          pendingTaskCount={meData?.pendingTaskCount ?? 0}
          isLoading={meLoading}
        />
      </div>

      <MyDocumentsWidget />
    </div>
  );
}
