"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { OrgChartTree } from "@/features/org/components/OrgChartTree";
import { useOrgChartQuery } from "@/features/org/api/orgApi";

export function OrgChartPage() {
  const chart = useOrgChartQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Organization chart</h1>
        <p className="text-sm text-muted-foreground">Explore reporting lines, drill into teams, and review headcount.</p>
      </div>
      {chart.isLoading ? <Skeleton className="h-[640px] w-full" /> : null}
      {chart.error ? <div className="rounded-lg border p-6 text-danger">Unable to load organization chart.</div> : null}
      {!chart.isLoading && !chart.error ? <OrgChartTree data={chart.data} /> : null}
    </div>
  );
}
