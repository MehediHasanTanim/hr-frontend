"use client";

import { CheckCircle, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { EntryStatus } from "@/features/payroll/types";

const badgeConfig: Record<EntryStatus, { label: string; className: string }> =
  {
    computed: { label: "Computed", className: "bg-blue-100 text-blue-700" },
    approved: { label: "Approved", className: "bg-green-100 text-green-700" },
    disbursed: {
      label: "Disbursed",
      className: "bg-green-100 text-green-700",
    },
    held: { label: "On hold", className: "bg-amber-100 text-amber-700" },
    reversed: { label: "Reversed", className: "bg-red-100 text-red-700" },
  };

export function EntryStatusBadge({
  status,
}: {
  status: EntryStatus;
}) {
  const config = badgeConfig[status];

  return (
    <span
      data-status={status}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
      )}
    >
      {status === "disbursed" && (
        <CheckCircle className="size-3" data-testid="icon-check" />
      )}
      {status === "held" && (
        <AlertCircle className="size-3 text-amber-600" />
      )}
      {config.label}
    </span>
  );
}
