// src/features/reports/components/ExportButton.tsx
// Sprint 6 — Export button with tooltip when report not saved

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, Download } from "lucide-react";
import type { ExportFormat } from "@/types/report.types";
import { useTriggerExport } from "../hooks/useTriggerExport";

interface ExportButtonProps {
  savedReportId: string | null;
  format: ExportFormat;
  onJobQueued: (jobId: string) => void;
}

export function ExportButton({ savedReportId, format, onJobQueued }: ExportButtonProps) {
  const triggerExport = useTriggerExport();
  const isPending = triggerExport.isPending;
  const disabled = savedReportId === null;

  function handleClick() {
    if (!savedReportId) return;
    triggerExport.mutate(
      { id: savedReportId, format },
      {
        onSuccess: (data) => onJobQueued(data.jobId),
      },
    );
  }

  const label = format === "xlsx" ? "Download XLSX" : "Download PDF";
  const button = (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled || isPending}
      onClick={handleClick}
      data-testid={`export-${format}-btn`}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {isPending ? "Queuing…" : label}
    </Button>
  );

  if (disabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>{button}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save this report first to export it.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}
