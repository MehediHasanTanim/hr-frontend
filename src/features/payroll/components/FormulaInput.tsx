"use client";

import { useEffect, useState } from "react";
import { evaluate } from "mathjs";

import { cn } from "@/lib/utils";

interface FormulaInputProps {
  formula: string;
  knownCodes: string[];
  onChange: (v: string) => void;
  error?: string;
  sampleValue?: number;
}

export function FormulaInput({
  formula,
  knownCodes,
  onChange,
  error,
  sampleValue = 10000,
}: FormulaInputProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [debouncedFormula, setDebouncedFormula] = useState(formula);

  // Debounce 400ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFormula(formula), 400);
    return () => clearTimeout(timer);
  }, [formula]);

  // Evaluate preview
  useEffect(() => {
    if (!debouncedFormula.trim()) {
      setPreview(null);
      setPreviewError(false);
      return;
    }

    try {
      let expr = debouncedFormula;
      for (const code of knownCodes) {
        const re = new RegExp(`\\b${code}\\b`, "g");
        expr = expr.replace(re, String(sampleValue));
      }
      const result = evaluate(expr);
      const formatted = (result as number).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setPreview(formatted);
      setPreviewError(false);
    } catch {
      setPreview(null);
      setPreviewError(true);
    }
  }, [debouncedFormula, knownCodes, sampleValue]);

  return (
    <div className="space-y-2">
      <input
        type="text"
        className={cn(
          "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 font-mono text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          error && "border-destructive",
        )}
        placeholder="e.g. BASIC * 0.4 or Math.min(BASIC * 0.12, 1800)"
        value={formula}
        onChange={(e) => onChange(e.target.value)}
      />
      {preview !== null && (
        <p className="text-xs text-muted-foreground">
          Preview: {preview} (with {knownCodes.join(", ")} = ₹
          {sampleValue.toLocaleString("en-IN")})
        </p>
      )}
      {previewError && (
        <p className="text-xs text-destructive">Invalid formula</p>
      )}
      {error && !previewError && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
