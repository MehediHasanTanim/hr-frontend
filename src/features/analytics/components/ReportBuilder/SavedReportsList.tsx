// src/features/analytics/components/ReportBuilder/SavedReportsList.tsx
"use client";
import React from "react";
import { Loader2, Play, Edit, Trash2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSavedReports, useDeleteSavedReport, useRunSavedReport, useReportRunHistory } from "@/features/analytics/hooks/useSavedReports";

interface Props { onEdit: (id: string) => void; }

export function SavedReportsList({ onEdit }: Props) {
  const { data, isLoading, isError } = useSavedReports();
  const deleteMutation = useDeleteSavedReport();
  const runMutation = useRunSavedReport();

  if (isLoading) return <div className="flex py-8 justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (isError) return <div className="py-8 text-center text-sm text-destructive">Failed to load reports.</div>;

  const reports = data ?? [];
  if (reports.length === 0) {
    return <div className="py-8 text-center text-sm text-muted-foreground">No saved reports yet.</div>;
  }

  return (
    <div data-testid="saved-reports-list" className="space-y-2">
      {reports.map((r) => (
        <div key={r.id} data-testid={`saved-report-${r.id}`} className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{r.name}</span>
              <Badge variant="outline">{r.entityType}</Badge>
              {r.isShared && <Badge variant="secondary">Shared</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{r.updatedAt && `Updated ${new Date(r.updatedAt).toLocaleDateString()}`}</p>
          </div>
          <div className="flex items-center gap-1">
            <button data-testid={`run-report-${r.id}`} onClick={() => runMutation.mutate(r.id)} disabled={runMutation.isPending} className="rounded p-1.5 hover:bg-green-100 text-green-700" title="Run"><Play className="h-4 w-4" /></button>
            <button onClick={() => onEdit(r.id)} className="rounded p-1.5 hover:bg-muted" title="Edit"><Edit className="h-4 w-4" /></button>
            <button data-testid={`delete-report-${r.id}`} onClick={() => { if (confirm("Delete this report?")) deleteMutation.mutate(r.id); }} className="rounded p-1.5 hover:bg-destructive/10 text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}
