// src/features/compensation/components/CompStatementBreakdown.tsx
// Sprint 10 F2 — Total Compensation Statement visual breakdown
//
// Backend business rule 5: three sections (guaranteed, variable, equity)
// MUST NOT be merged into a single flattened total in the UI.

"use client";

import React from "react";
import { Loader2, Info } from "lucide-react";
import { useCompStatementQuery } from "@/features/compensation/hooks/useCompStatementQuery";
import { formatCurrency } from "@/lib/utils";

function SectionPanel({
  title,
  children,
  tooltip,
}: {
  title: string;
  children: React.ReactNode;
  tooltip?: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-1.5 mb-3">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {tooltip && (
          <span
            data-testid="equity-tooltip"
            title={tooltip}
            className="inline-flex cursor-help text-muted-foreground"
          >
            <Info className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

interface CompStatementBreakdownProps {
  employeeId: string;
}

export function CompStatementBreakdown({
  employeeId,
}: CompStatementBreakdownProps) {
  const { data, isLoading, isError } = useCompStatementQuery(employeeId);

  if (isLoading) {
    return (
      <div
        data-testid="comp-statement-loading"
        className="flex items-center justify-center py-12"
      >
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        data-testid="comp-statement-error"
        className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
      >
        Unable to load compensation statement.
      </div>
    );
  }

  return (
    <div
      data-testid="comp-statement-breakdown"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {/* Guaranteed Cash */}
      <SectionPanel title="Guaranteed Cash">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base Salary</span>
            <span className="font-medium" data-testid="base-salary">
              {formatCurrency(data.guaranteedCash.baseSalary)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Benefits (Employer)</span>
            <span className="font-medium" data-testid="benefits-employer-value">
              {formatCurrency(data.guaranteedCash.benefitsEmployerValue)}
            </span>
          </div>
        </div>
      </SectionPanel>

      {/* Variable / Bonus */}
      <SectionPanel title="Variable / Bonus">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bonus Disbursed YTD</span>
            <span className="font-medium" data-testid="bonus-ytd">
              {formatCurrency(data.variableCash.bonusDisbursedYTD)}
            </span>
          </div>
        </div>
      </SectionPanel>

      {/* Equity (illustrative) */}
      <SectionPanel
        title="Equity"
        tooltip="Illustrative value — not guaranteed compensation"
      >
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vested Units</span>
            <span className="font-medium" data-testid="vested-units">
              {data.equity.vestedUnits.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Unvested Units</span>
            <span className="font-medium" data-testid="unvested-units">
              {data.equity.unvestedUnits.toLocaleString()}
            </span>
          </div>
          {data.equity.illustrativeUnrealizedValue !== null && (
            <div className="flex justify-between border-t pt-2">
              <span className="text-xs text-muted-foreground italic">
                Illustrative Value
              </span>
              <span
                className="font-medium text-xs italic"
                data-testid="illustrative-value"
              >
                {formatCurrency(data.equity.illustrativeUnrealizedValue)}
              </span>
            </div>
          )}
        </div>
      </SectionPanel>
    </div>
  );
}
