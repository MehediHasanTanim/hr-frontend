// src/features/mss/components/BulkActionBar.tsx
// Sprint 6 — Sticky bulk action bar for MSS approvals

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface BulkActionBarProps {
  selectedIds: string[];
  onApproveAll: () => void;
  onRejectAll: () => void;
}

export function BulkActionBar({ selectedIds, onApproveAll, onRejectAll }: BulkActionBarProps) {
  if (selectedIds.length === 0) return null;

  return (
    <div
      className="sticky bottom-4 mx-auto flex w-fit items-center gap-3 rounded-xl border bg-background px-4 py-3 shadow-lg"
      data-testid="bulk-action-bar"
    >
      <span className="text-sm font-medium">
        {selectedIds.length} selected
      </span>
      <Button
        size="sm"
        className="bg-green-600 hover:bg-green-700"
        onClick={onApproveAll}
        data-testid="bulk-approve-btn"
      >
        <Check className="mr-1 h-4 w-4" />
        Approve All
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={onRejectAll}
        data-testid="bulk-reject-btn"
      >
        <X className="mr-1 h-4 w-4" />
        Reject All
      </Button>
    </div>
  );
}
