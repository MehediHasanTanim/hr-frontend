"use client";

import { Loader2, CheckCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CycleStatus } from "@/features/payroll/types";

const badgeConfig: Record<
  CycleStatus,
  { label: string; className: string }
> = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-700" },
  processing: {
    label: "Processing...",
    className: "bg-amber-100 text-amber-700",
  },
  computed: { label: "Computed", className: "bg-blue-100 text-blue-700" },
  approved: { label: "Approved", className: "bg-green-100 text-green-700" },
  disbursed: {
    label: "Disbursed",
    className: "bg-green-100 text-green-700",
  },
  reversed: { label: "Reversed", className: "bg-red-100 text-red-700" },
};

export function CycleStatusBadge({ status }: { status: CycleStatus }) {
  const config = badgeConfig[status];

  return (
    <span
      data-status={status}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
      )}
    >
      {status === "processing" && (
        <Loader2 className="size-3 animate-spin" role="status" data-testid="spinner" />
      )}
      {status === "disbursed" && (
        <CheckCircle className="size-3" data-testid="icon-check" />
      )}
      {config.label}
    </span>
  );
}
