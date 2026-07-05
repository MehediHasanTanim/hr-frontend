// src/features/ess/components/LeaveBalanceWidget.tsx
// Sprint 6 — ESS leave balance progress bars

"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LeaveBalanceSummary } from "@/types/mss.types";
import { CalendarRange } from "lucide-react";

interface LeaveBalanceWidgetProps {
  balances: LeaveBalanceSummary[];
  isLoading: boolean;
}

function BalanceBar({ label, taken, entitled }: { label: string; taken: number; entitled: number }) {
  const pct = entitled > 0 ? (taken / entitled) * 100 : 0;
  const remaining = entitled - taken;

  const color =
    pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-500" : "bg-green-500";

  return (
    <div className="space-y-1" data-testid={`leave-balance-${label}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {taken} / {entitled} days
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className={cn("h-2 rounded-full transition-all", color)}
          style={{ width: `${Math.min(pct, 100)}%` }}
          role="progressbar"
          aria-valuenow={taken}
          aria-valuemin={0}
          aria-valuemax={entitled}
          aria-label={`${label}: ${taken} of ${entitled} days used`}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{remaining}</span> days remaining
      </p>
    </div>
  );
}

export function LeaveBalanceWidget({ balances, isLoading }: LeaveBalanceWidgetProps) {
  return (
    <Card data-testid="leave-balance-widget">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Leave Balances</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-16" />
            </div>
          ))
        ) : balances.length === 0 ? (
          <div className="flex flex-col items-center py-4 text-center">
            <CalendarRange className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              No leave entitlements found. Contact HR.
            </p>
          </div>
        ) : (
          balances.map((b) => (
            <BalanceBar
              key={b.leaveType}
              label={b.leaveType}
              taken={b.taken}
              entitled={b.entitled}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
