// src/features/ess/components/UpcomingLeaveWidget.tsx
// Sprint 6 — ESS upcoming approved leave widget

"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/query-keys";

interface LeaveEvent {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
}

export function UpcomingLeaveWidget() {
  const today = new Date().toISOString().split("T")[0]!;

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.LEAVE_REQUESTS({ status: "APPROVED", startDate: today, limit: 3 }),
    queryFn: () =>
      apiClient
        .get<{ data: LeaveEvent[] }>("/api/v1/leave/requests", {
          params: { status: "APPROVED", startDate: today, limit: 3 },
        })
        .then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const leaves = data?.data ?? [];

  return (
    <Card data-testid="upcoming-leave-widget">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold">Upcoming Leave</CardTitle>
        <Button asChild variant="ghost" size="sm" data-testid="apply-leave-btn">
          <Link href="/leave/apply">
            <Plus className="mr-1 h-3.5 w-3.5" />
            Apply
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="mb-2 h-10 w-full" />
          ))
        ) : leaves.length === 0 ? (
          <div className="flex flex-col items-center py-4 text-center">
            <CalendarDays className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              No upcoming leave. Take a break!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaves.map((leave) => (
              <div
                key={leave.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {leave.leaveType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {leave.days}d
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {format(new Date(leave.startDate), "dd MMM")} –{" "}
                    {format(new Date(leave.endDate), "dd MMM yyyy")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
