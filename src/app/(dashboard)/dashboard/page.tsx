// Sprint 6 1.6.F1 — HR Dashboard landing page
"use client";

import React from "react";
import { Users, CalendarX, Banknote, UserPlus, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { MetricCard } from "@/features/dashboard/components/MetricCard";
import { ActivityFeed } from "@/features/dashboard/components/ActivityFeed";
import { QuickActions } from "@/features/dashboard/components/QuickActions";
import { DateRangeSelector } from "@/features/dashboard/components/DateRangeSelector";
import {
  useHeadcountMetric,
  useOpenLeavesMetric,
  useRecentHiresMetric,
  useActivityFeed,
} from "@/features/dashboard/hooks/useDashboardMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const role = useAuthStore((s) => s.user?.role);
  const headcount = useHeadcountMetric();
  const openLeaves = useOpenLeavesMetric();
  const recentHires = useRecentHiresMetric();
  const activityFeed = useActivityFeed();

  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your operations overview</p>
        </div>
        <DateRangeSelector />
      </div>

      {/* ─── Metric Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          title="Total Headcount"
          value={headcount.data?.totalRows ?? 0}
          secondaryLabel="Active employees"
          secondaryValue={headcount.data?.rows?.[0]?.headcount as string | number}
          isLoading={headcount.isLoading}
          isError={headcount.isError}
          icon={<Users className="h-5 w-5" />}
          colorScheme="blue"
        />

        <MetricCard
          title="Open Leave Requests"
          value={openLeaves.data?.total ?? 0}
          secondaryLabel="Pending"
          secondaryValue={openLeaves.data?.total ?? 0}
          isLoading={openLeaves.isLoading}
          isError={openLeaves.isError}
          icon={<CalendarX className="h-5 w-5" />}
          colorScheme="amber"
        />

        <MetricCard
          title="Payroll Status"
          value={currentPeriod}
          secondaryLabel="Period"
          secondaryValue="View details"
          isLoading={false}
          icon={<Banknote className="h-5 w-5" />}
          colorScheme="green"
        />

        <MetricCard
          title="Recent Hires"
          value={recentHires.data?.totalRows ?? 0}
          secondaryLabel="Last 30 days"
          secondaryValue={
            recentHires.data?.rows?.slice(0, 3)?.map((r) => (r as { employeeName?: string }).employeeName)?.join(", ") ?? "—"
          }
          isLoading={recentHires.isLoading}
          isError={recentHires.isError}
          icon={<UserPlus className="h-5 w-5" />}
          colorScheme="purple"
        />
      </div>

      {/* ─── Quick Actions ──────────────────────────────────────────── */}
      <QuickActions />

      {/* ─── Recent Activity (HR_ADMIN only) ────────────────────────── */}
      {role === "HR_ADMIN" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            <Link
              href="/admin/audit-logs"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              data-testid="view-all-audit-logs"
            >
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <ActivityFeed
              entries={(activityFeed.data?.data as unknown[]) ?? []}
              isLoading={activityFeed.isLoading}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
