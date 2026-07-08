// src/features/analytics/components/ExecutiveDashboard/WorkforceDistributionDonut.tsx
// Sprint 11 F1 — Donut chart with dimension switcher (department/type/location)

"use client";
import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#ca8a04", "#9333ea", "#0891b2", "#be185d", "#64748b"];

type Dimension = "department" | "employmentType" | "location";

interface BreakdownData {
  departmentBreakdown: { department: string; count: number }[];
  employmentTypeBreakdown: { type: string; count: number }[];
  locationBreakdown: { location: string; count: number }[];
}

interface WorkforceDistributionDonutProps {
  data: BreakdownData | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function WorkforceDistributionDonut({ data, isLoading, isError }: WorkforceDistributionDonutProps) {
  const [dimension, setDimension] = useState<Dimension>("department");

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border text-sm text-muted-foreground">
        Unable to load workforce data.
      </div>
    );
  }

  const chartData = dimension === "department"
    ? data.departmentBreakdown.map((d) => ({ name: d.department, value: d.count }))
    : dimension === "employmentType"
      ? data.employmentTypeBreakdown.map((d) => ({ name: d.type, value: d.count }))
      : data.locationBreakdown.map((d) => ({ name: d.location, value: d.count }));

  return (
    <div data-testid="workforce-distribution-donut" className="rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">Workforce Distribution</h4>
        <div className="flex rounded-md border text-xs">
          {(["department", "employmentType", "location"] as Dimension[]).map((d) => (
            <button
              key={d}
              type="button"
              data-testid={`dimension-${d}`}
              onClick={() => setDimension(d)}
              className={cn(
                "px-2 py-1 first:rounded-l-md last:rounded-r-md transition-colors",
                dimension === d
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
            >
              {d === "employmentType" ? "Type" : d === "department" ? "Dept" : "Location"}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
