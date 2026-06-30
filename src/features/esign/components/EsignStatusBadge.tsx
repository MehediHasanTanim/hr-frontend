"use client";

import type { EsignStatus } from "../types/esign.types";

const statusConfig: Record<
  EsignStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-800" },
  SIGNED: { label: "Signed", className: "bg-green-100 text-green-800" },
  DECLINED: { label: "Declined", className: "bg-red-100 text-red-800" },
  EXPIRED: { label: "Expired", className: "bg-gray-100 text-gray-800" },
};

interface EsignStatusBadgeProps {
  status: EsignStatus;
}

export function EsignStatusBadge({ status }: EsignStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
