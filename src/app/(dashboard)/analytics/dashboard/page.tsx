// src/app/(dashboard)/analytics/dashboard/page.tsx
// Sprint 11 F1 — Executive HR Dashboard

"use client";
import React, { useState } from "react";
import { KpiCard } from "@/features/analytics/components/ExecutiveDashboard/KpiCard";
import { HeadcountTrendChart } from "@/features/analytics/components/ExecutiveDashboard/HeadcountTrendChart";
import { PayrollTrendChart } from "@/features/analytics/components/ExecutiveDashboard/PayrollTrendChart";
import { WorkforceDistributionDonut } from "@/features/analytics/components/ExecutiveDashboard/WorkforceDistributionDonut";
import { LeaveLiabilityWidget } from "@/features/analytics/components/ExecutiveDashboard/LeaveLiabilityWidget";
import { useWorkforceDemographics } from "@/features/analytics/hooks/useWorkforceDemographics";
import { usePayrollTrends } from "@/features/analytics/hooks/usePayrollTrends";
import { useLeaveLiability } from "@/features/analytics/hooks/useLeaveLiability";

export default function AnalyticsDashboardPage() {
  const [months, setMonths] = useState(12);
  const demographics = useWorkforceDemographics();
  const payroll = usePayrollTrends(months);
  const liability = useLeaveLiability();

  const demo = demographics.data;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Executive Dashboard</h1>
        <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className="h-9 rounded-md border px-2 text-sm">
          {[6, 12, 24].map((m) => <option key={m} value={m}>{m} months</option>)}
        </select>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Employees" value={demo?.totalEmployees?.toLocaleString() ?? "—"} isLoading={demographics.isLoading} />
        <KpiCard label="New Hires (MTD)" value={demo?.newHiresMtd?.toLocaleString() ?? "—"} trend="up" deltaVsPreviousPeriod="+3" deltaSemantics="higherIsBetter" isLoading={demographics.isLoading} />
        <KpiCard label="Exits (MTD)" value={demo?.exitsMtd?.toLocaleString() ?? "—"} trend="down" deltaVsPreviousPeriod="-1" deltaSemantics="lowerIsBetter" isLoading={demographics.isLoading} />
        <KpiCard label="Avg Tenure" value={demo ? `${demo.avgTenureMonths} mo` : "—"} isLoading={demographics.isLoading} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <HeadcountTrendChart
          data={payroll.data?.map((p) => ({ month: p.month, headcount: demo?.totalEmployees ?? 0 }))}
          isLoading={demographics.isLoading || payroll.isLoading}
          isError={demographics.isError || payroll.isError}
        />
        <PayrollTrendChart data={payroll.data} isLoading={payroll.isLoading} isError={payroll.isError} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <WorkforceDistributionDonut data={demo ? {
          departmentBreakdown: demo.departmentBreakdown,
          employmentTypeBreakdown: demo.employmentTypeBreakdown,
          locationBreakdown: demo.locationBreakdown,
        } : undefined} isLoading={demographics.isLoading} isError={demographics.isError} />
        <LeaveLiabilityWidget data={liability.data} isLoading={liability.isLoading} isError={liability.isError} />
      </div>
    </div>
  );
}
