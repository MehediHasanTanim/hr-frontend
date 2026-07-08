// src/features/analytics/components/ExecutiveDashboard/HeadcountTrendChart.tsx
// Sprint 11 F1 — Headcount trend over time (Recharts LineChart)

"use client";
import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";

interface HeadcountTrendChartProps {
  data: { month: string; headcount: number }[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function HeadcountTrendChart({
  data,
  isLoading,
  isError,
}: HeadcountTrendChartProps) {
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
        Unable to load headcount trend.
      </div>
    );
  }

  return (
    <div data-testid="headcount-trend-chart" className="rounded-lg border p-4">
      <h4 className="text-sm font-semibold mb-3">Headcount Trend</h4>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
          <XAxis dataKey="month" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="headcount"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
