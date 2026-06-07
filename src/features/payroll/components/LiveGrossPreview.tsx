"use client";

import { useMemo } from "react";
import { evaluate } from "mathjs";

import { Separator } from "@/components/ui/separator";
import type { StructureComponent } from "@/features/payroll/types";

function fmt(amount: number) {
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface ComputedRow {
  componentId: string;
  name: string;
  code: string;
  type: "earning" | "deduction" | "employer_contribution";
  amount: number;
  error?: string;
}

export function LiveGrossPreview({
  components,
  monthlyCTC = 50000,
}: {
  components: StructureComponent[];
  monthlyCTC?: number;
}) {
  const computed = useMemo(() => {
    const context: Record<string, number> = { BASIC: 0, CTC: monthlyCTC };
    const rows: ComputedRow[] = [];
    const earnings: ComputedRow[] = [];
    const deductions: ComputedRow[] = [];
    const contributions: ComputedRow[] = [];

    const sorted = [...components].sort((a, b) => a.sortOrder - b.sortOrder);

    for (const sc of sorted) {
      const comp = sc.component;
      let amount = 0;
      let error: string | undefined;

      try {
        if (comp.calculationType === "fixed") {
          amount = sc.defaultValue;
        } else if (comp.calculationType === "percentage_of_base") {
          const base = context["BASIC"] || monthlyCTC * 0.5;
          amount = base * (sc.defaultValue / 100);
        } else if (comp.calculationType === "formula" && comp.formula) {
          let expr = comp.formula;
          for (const [key, val] of Object.entries(context)) {
            const re = new RegExp(`\\b${key}\\b`, "g");
            expr = expr.replace(re, String(val));
          }
          const result = evaluate(expr);
          amount = Math.max(0, result as number);
        }
      } catch {
        error = `Formula error in ${comp.name}`;
      }

      const row: ComputedRow = {
        componentId: comp.id,
        name: comp.name,
        code: comp.code,
        type: comp.type,
        amount,
        error,
      };
      rows.push(row);

      if (comp.type === "earning") {
        context[comp.code] = amount;
        earnings.push(row);
      } else if (comp.type === "deduction") {
        deductions.push(row);
      } else {
        contributions.push(row);
      }
    }

    return { rows, earnings, deductions, contributions };
  }, [components, monthlyCTC]);

  const grossTotal = computed.earnings.reduce((s, r) => s + r.amount, 0);
  const deductionTotal = computed.deductions.reduce((s, r) => s + r.amount, 0);
  const netPayable = Math.max(0, grossTotal - deductionTotal);

  if (components.length === 0) {
    return (
      <div className="rounded-lg border p-4 text-center text-sm text-muted-foreground">
        Add components to see the preview
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4 text-sm">
      <p className="mb-3 text-xs font-medium text-muted-foreground">
        Live Preview (sample: ₹
        {monthlyCTC.toLocaleString("en-IN")} CTC/mo)
      </p>

      {computed.earnings.length > 0 && (
        <>
          <p className="mb-1 text-xs font-semibold text-green-700">Earnings</p>
          {computed.earnings.map((r) => (
            <Row key={r.componentId} row={r} />
          ))}
          <Separator className="my-1" />
          <div className="flex justify-between py-1 font-medium">
            <span>Gross</span>
            <span>{fmt(grossTotal)}</span>
          </div>
        </>
      )}

      {computed.deductions.length > 0 && (
        <>
          <div className="mt-3" />
          <p className="mb-1 text-xs font-semibold text-red-700">
            Deductions
          </p>
          {computed.deductions.map((r) => (
            <Row key={r.componentId} row={r} />
          ))}
          <Separator className="my-1" />
          <div className="flex justify-between py-1 font-medium">
            <span>Total Deductions</span>
            <span>{fmt(deductionTotal)}</span>
          </div>
        </>
      )}

      {computed.contributions.length > 0 && (
        <>
          <div className="mt-3" />
          <p className="mb-1 text-xs font-semibold text-blue-700">
            Employer Contributions
          </p>
          {computed.contributions.map((r) => (
            <Row key={r.componentId} row={r} />
          ))}
        </>
      )}

      <Separator className="my-2" />
      <div className="flex justify-between py-1 font-semibold">
        <span>Net Payable</span>
        <span className="text-primary">{fmt(netPayable)}</span>
      </div>
    </div>
  );
}

function Row({ row }: { row: ComputedRow }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-muted-foreground">{row.name}</span>
      {row.error ? (
        <span className="text-xs text-destructive">{row.error}</span>
      ) : (
        <span>{fmt(row.amount)}</span>
      )}
    </div>
  );
}
