// src/features/ess/components/PendingAcknowledgementsWidget.tsx
// Sprint 6 — ESS pending eSign/policy acknowledgements widget

"use client";

import React from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, PenLine } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMe } from "../hooks/useMe";
import { format } from "date-fns";

interface PendingTask {
  id: string;
  policyName: string;
  dueDate: string;
}

interface PendingAcknowledgementsWidgetProps {
  pendingTaskCount: number;
  isLoading: boolean;
}

export function PendingAcknowledgementsWidget({
  pendingTaskCount,
  isLoading: meLoading,
}: PendingAcknowledgementsWidgetProps) {
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: QUERY_KEYS.PENDING_TASKS({ status: "PENDING", type: "ESIGN", limit: 3 }),
    queryFn: () =>
      apiClient
        .get<{ data: PendingTask[] }>("/api/v1/me/tasks", {
          params: { status: "PENDING", type: "ESIGN", limit: 3 },
        })
        .then((r) => r.data),
    staleTime: 2 * 60 * 1000,
    enabled: pendingTaskCount > 0,
  });

  const loading = meLoading || (pendingTaskCount > 0 && tasksLoading);

  return (
    <Card data-testid="pending-acknowledgements-widget">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          Pending Acknowledgements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="mb-2 h-10 w-full" />
          ))
        ) : pendingTaskCount === 0 ? (
          <div className="flex flex-col items-center py-4 text-center">
            <CheckCircle2 className="mb-2 h-8 w-8 text-green-500" />
            <p className="text-xs text-muted-foreground">
              All caught up! No pending acknowledgements.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium" data-testid="pending-ack-count">
                {pendingTaskCount} pending
              </span>
            </div>
            {tasks?.data?.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{task.policyName}</p>
                  <p className="text-xs text-muted-foreground">
                    Due: {format(new Date(task.dueDate), "dd MMM yyyy")}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/documents/sign/${task.id}`}>
                    <PenLine className="mr-1 h-3.5 w-3.5" />
                    Sign
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
