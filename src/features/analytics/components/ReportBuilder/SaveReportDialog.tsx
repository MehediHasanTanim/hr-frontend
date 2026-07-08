// src/features/analytics/components/ReportBuilder/SaveReportDialog.tsx
"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCreateSavedReport, useUpdateSavedReport } from "@/features/analytics/hooks/useSavedReports";
import { createSavedReportSchema, type CreateSavedReportFormValues } from "@/features/analytics/schemas/analytics.schema";
import type { ReportDefinition, ReportEntityType } from "@/features/analytics/types/analytics";

interface Props {
  definition: ReportDefinition;
  entityType: ReportEntityType;
  editingReportId?: string;
  initialName?: string;
  initialDesc?: string;
  initialShared?: boolean;
  onClose: () => void;
}

export function SaveReportDialog({ definition, entityType, editingReportId, initialName = "", initialDesc = "", initialShared = false, onClose }: Props) {
  const createMutation = useCreateSavedReport();
  const updateMutation = useUpdateSavedReport();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { register, handleSubmit, formState: { errors } } = useForm<CreateSavedReportFormValues>({
    resolver: zodResolver(createSavedReportSchema),
    defaultValues: { name: initialName, description: initialDesc, entityType, definition, isShared: initialShared },
  });

  const onSubmit = (data: CreateSavedReportFormValues) => {
    if (editingReportId) {
      updateMutation.mutate({ id: editingReportId, ...data }, { onSuccess: onClose });
    } else {
      createMutation.mutate(data, { onSuccess: onClose });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{editingReportId ? "Edit Report" : "Save Report"}</h3>
          <button type="button" onClick={onClose} className="rounded p-1 hover:text-foreground" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input {...register("name")} data-testid="save-report-name" />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <Input {...register("description")} data-testid="save-report-desc" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isShared")} data-testid="save-report-shared" className="rounded accent-primary" />
            Share with team
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
            <button type="submit" data-testid="save-report-submit" disabled={isPending} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
