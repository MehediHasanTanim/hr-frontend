// src/features/analytics/components/AttritionRiskTable/AttritionRiskTable.tsx
"use client";
import React from "react";
import { Loader2 } from "lucide-react";
import { RiskScoreBadge } from "./RiskScoreBadge";
import { useAttritionRiskScores } from "@/features/analytics/hooks/useAttritionRiskScores";
import type { AttritionRiskScore } from "@/features/analytics/types/analytics";

function SignalChip({ label, value }: { label: string; value: number }) {
  if (value === 0) return null;
  return (
    <span data-testid="signal-chip" className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
      {label}: {value}
    </span>
  );
}

function SignalDetailPopover({ signals }: { signals: AttritionRiskScore["signals"] }) {
  return (
    <div data-testid="signal-detail" className="text-xs space-y-1">
      <div className="flex justify-between"><span>Tenure:</span><span>{signals.tenureMonths}mo (signal: {signals.tenureSignal})</span></div>
      <div className="flex justify-between"><span>Last Review:</span><span>{signals.lastReviewRating ?? "N/A"} (signal: {signals.reviewSignal})</span></div>
      <div className="flex justify-between"><span>Absences (90d):</span><span>{signals.absenceCountLast90d} (signal: {signals.absenceSignal})</span></div>
      <div className="flex justify-between font-medium border-t pt-1"><span>Total:</span><span>{signals.totalScore}</span></div>
    </div>
  );
}

export function AttritionRiskTable() {
  const { data, isLoading, isError } = useAttritionRiskScores();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  if (isLoading) return <div className="flex py-12 justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (isError) return <div className="py-8 text-center text-sm text-destructive">Unable to load attrition risk data.</div>;

  const items = data ?? [];
  if (items.length === 0) {
    return <div className="py-8 text-center text-sm text-muted-foreground">No attrition risk data available.</div>;
  }

  return (
    <div data-testid="attrition-risk-table" className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Employee</th>
            <th className="px-3 py-2 text-left font-medium">Department</th>
            <th className="px-3 py-2 text-left font-medium">Risk Score</th>
            <th className="px-3 py-2 text-left font-medium">Top Signals</th>
            <th className="px-3 py-2 text-left font-medium">Computed</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <React.Fragment key={item.id}>
              <tr
                data-testid={`risk-row-${item.id}`}
                className="border-t hover:bg-muted/30 cursor-pointer"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <td className="px-3 py-2">{item.employeeName}</td>
                <td className="px-3 py-2 text-muted-foreground">{item.department}</td>
                <td className="px-3 py-2"><RiskScoreBadge band={item.riskBand} score={item.riskScore} /></td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    <SignalChip label="Tenure" value={item.signals.tenureSignal} />
                    <SignalChip label="Review" value={item.signals.reviewSignal} />
                    <SignalChip label="Absences" value={item.signals.absenceSignal} />
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {new Date(item.computedAt).toLocaleDateString()}
                </td>
              </tr>
              {expandedId === item.id && (
                <tr key={`${item.id}-detail`}>
                  <td colSpan={5} className="px-3 py-3 bg-muted/20">
                    <SignalDetailPopover signals={item.signals} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
