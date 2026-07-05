// src/features/reports/components/SaveReportModal.tsx
// Sprint 6 — Save report modal with name + description

"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaveReport } from "../hooks/useSavedReports";
import type { ReportKey } from "@/types/report.types";
import type { ReportFilters } from "../schemas/report-filter.schema";
import { Loader2 } from "lucide-react";

const saveReportSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
});

type SaveReportForm = z.infer<typeof saveReportSchema>;

interface SaveReportModalProps {
  open: boolean;
  onClose: () => void;
  reportKey: ReportKey;
  filters: ReportFilters;
}

export function SaveReportModal({ open, onClose, reportKey, filters }: SaveReportModalProps) {
  const saveReport = useSaveReport();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SaveReportForm>({
    resolver: zodResolver(saveReportSchema),
    defaultValues: { name: "", description: "" },
  });

  function onSubmit(data: SaveReportForm) {
    saveReport.mutate(
      {
        name: data.name,
        reportKey,
        parameters: { ...filters, reportKey },
        description: data.description,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent data-testid="save-report-modal">
        <DialogHeader>
          <DialogTitle>Save Report</DialogTitle>
          <DialogDescription>
            Save your current filters to run this report again later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="report-name">Report Name</Label>
            <Input
              id="report-name"
              {...register("name")}
              placeholder="e.g. Monthly Headcount Q2"
              aria-invalid={!!errors.name}
              data-testid="save-report-name"
            />
            {errors.name && (
              <p className="text-xs text-red-500" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="report-description">Description (optional)</Label>
            <Input
              id="report-description"
              {...register("description")}
              placeholder="Brief description of this report..."
              data-testid="save-report-description"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveReport.isPending} data-testid="save-report-submit">
              {saveReport.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
