// src/features/analytics/components/ExecutiveDashboard/PayrollTrendChart.tsx
// Sprint 11 F1 — Payroll trend (Recharts AreaChart), currency-formatted

"use client";
import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PayrollTrendChartProps {
  data: { month: string; grossPayroll: number; netPayroll: number }[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function PayrollTrendChart({ data, isLoading, isError }: PayrollTrendChartProps) {
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
        Unable to load payroll trend.
      </div>
    );
  }

  return (
    <div data-testid="payroll-trend-chart" className="rounded-lg border p-4">
      <h4 className="text-sm font-semibold mb-3">Payroll Trend</h4>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
          <XAxis dataKey="month" fontSize={12} />
          <YAxis
            fontSize={12}
            tickFormatter={(v: number) => formatCurrency(v).replace(/\.00$/, "")}
          />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Area
            type="monotone"
            dataKey="grossPayroll"
            stroke="#2563eb"
            fill="#2563eb20"
            strokeWidth={2}
            name="Gross"
          />
          <Area
            type="monotone"
            dataKey="netPayroll"
            stroke="#16a34a"
            fill="#16a34a20"
            strokeWidth={2}
            name="Net"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
