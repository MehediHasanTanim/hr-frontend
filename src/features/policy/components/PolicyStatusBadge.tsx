"use client";

import type { PolicyStatus } from "../types/policy.types";

const statusConfig: Record<PolicyStatus, { label: string; className: string }> =
  {
    DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-800" },
    PUBLISHED: {
      label: "Published",
      className: "bg-green-100 text-green-800",
    },
    ARCHIVED: { label: "Archived", className: "bg-red-100 text-red-800" },
  };

interface PolicyStatusBadgeProps {
  status: PolicyStatus;
}

export function PolicyStatusBadge({ status }: PolicyStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
