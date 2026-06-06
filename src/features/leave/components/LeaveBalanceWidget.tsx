"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeaveBalances } from "@/features/leave/api/leaveApi";
import { cn } from "@/lib/utils";

function getStatusColor(closing: number) {
  if (closing > 5) return "default";
  if (closing > 0) return "low";
  return "empty";
}

export function LeaveBalanceWidget() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const { data: balances = [], isLoading, error, refetch } = useLeaveBalances(year);

  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="space-y-4">
      {/* Year selector */}
      <div className="flex items-center gap-2">
        <label htmlFor="balance-year" className="text-sm font-medium">
          Year
        </label>
        <select
          id="balance-year"
          className="h-7 rounded-lg border border-input bg-background px-2 text-sm"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex min-w-[200px] flex-col gap-3 rounded-lg border p-4"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm">
          <p className="text-destructive">Could not load balances</p>
          <Button size="xs" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-1 size-3" />
            Retry
          </Button>
        </div>
      ) : balances.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No leave types configured for this year
        </p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {balances.map((balance) => {
            const displayClosing = balance.closing < 0 ? 0 : balance.closing;
            const status = getStatusColor(balance.closing);
            const formattedClosing =
              displayClosing === Math.floor(displayClosing)
                ? String(displayClosing)
                : displayClosing.toFixed(1);

            return (
              <article
                key={balance.leaveTypeId}
                data-testid="balance-card"
                data-status={status}
                className={cn(
                  "flex min-w-[200px] flex-col gap-2 rounded-lg border p-4",
                  status === "default" && "border-border",
                  status === "low" &&
                    "border-l-4 border-l-amber-400 bg-amber-50/40",
                  status === "empty" &&
                    "border-l-4 border-l-destructive bg-destructive/5",
                )}
              >
                <p className="truncate text-sm font-medium text-muted-foreground">
                  {balance.leaveTypeName}
                </p>

                <p
                  className={cn(
                    "text-[28px] font-medium leading-none",
                    status === "empty" && "text-destructive",
                  )}
                >
                  {formattedClosing}
                </p>
                <p className="text-xs text-muted-foreground">days available</p>

                <div className="mt-1 grid grid-cols-2 gap-2 border-t pt-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Accrued</p>
                    <p className="font-medium">
                      {balance.entitled} day{balance.entitled !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Used</p>
                    <p className="font-medium">
                      {balance.used} day{balance.used !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {balance.carriedForward > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Carry-forward: {balance.carriedForward} day
                    {balance.carriedForward !== 1 ? "s" : ""}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
