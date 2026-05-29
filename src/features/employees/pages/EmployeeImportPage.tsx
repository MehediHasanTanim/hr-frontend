"use client";

import { useState } from "react";
import { RotateCcw, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBulkImportJobQuery, useBulkImportMutation } from "@/features/employees/api/employeeApi";
import { readApiErrorMessage } from "@/lib/api-client";
import { useToastActions } from "@/stores/toast.store";

export function EmployeeImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState("");
  const importEmployees = useBulkImportMutation();
  const job = useBulkImportJobQuery(jobId);
  const { addToast } = useToastActions();

  function selectFile(nextFile?: File) {
    if (!nextFile) {
      setFile(null);
      return;
    }
    if (!nextFile.name.toLowerCase().endsWith(".csv") && nextFile.type !== "text/csv") {
      addToast({ message: "Choose a CSV file", variant: "warning", duration: 3000 });
      return;
    }
    setFile(nextFile);
  }

  function startImport() {
    if (!file) {
      return;
    }
    importEmployees.mutate(file, {
      onSuccess: (createdJob) => setJobId(createdJob.id),
      onError: (error) => addToast({ message: readApiErrorMessage(error, "Unable to start import"), variant: "danger", duration: 4000 }),
    });
  }

  const currentJob = job.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">CSV employee import</h1>
        <p className="text-sm text-muted-foreground">Upload a CSV, monitor the import job, and review row-level errors.</p>
      </div>
      <section className="space-y-4 rounded-lg border p-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium">CSV file</span>
          <input accept=".csv,text/csv" type="file" onChange={(event) => selectFile(event.target.files?.[0])} />
        </label>
        {file ? <p className="text-sm text-muted-foreground">{file.name} · {(file.size / 1024).toFixed(1)} KB</p> : null}
        <div className="flex gap-2">
          <Button disabled={!file || importEmployees.isPending} type="button" onClick={startImport}><Upload className="size-4" /> Start import</Button>
          <Button disabled={!file} type="button" variant="outline" onClick={startImport}><RotateCcw className="size-4" /> Retry</Button>
        </div>
      </section>

      {currentJob ? (
        <section className="space-y-4 rounded-lg border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Import status</h2>
            <Badge variant={currentJob.status === "failed" ? "destructive" : "outline"}>{currentJob.status}</Badge>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${currentJob.progress ?? (currentJob.status === "completed" ? 100 : 10)}%` }} />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <p className="rounded-lg bg-muted/50 p-3 text-sm">Total rows<br /><span className="text-lg font-semibold">{currentJob.totalRows ?? 0}</span></p>
            <p className="rounded-lg bg-muted/50 p-3 text-sm">Successful rows<br /><span className="text-lg font-semibold">{currentJob.successfulRows ?? 0}</span></p>
            <p className="rounded-lg bg-muted/50 p-3 text-sm">Failed rows<br /><span className="text-lg font-semibold">{currentJob.failedRows ?? 0}</span></p>
          </div>
          {currentJob.errorReportUrl ? <Button render={<a href={currentJob.errorReportUrl} />} variant="outline">Download error report</Button> : null}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                <tr><th className="px-3 py-2">Row</th><th className="px-3 py-2">Field</th><th className="px-3 py-2">Error message</th><th className="px-3 py-2">Raw value</th></tr>
              </thead>
              <tbody className="divide-y">
                {(currentJob.errors ?? []).length ? currentJob.errors?.map((error) => (
                  <tr key={`${error.rowNumber}-${error.field}`}><td className="px-3 py-2">{error.rowNumber}</td><td className="px-3 py-2">{error.field}</td><td className="px-3 py-2">{error.message}</td><td className="px-3 py-2">{error.rawValue ?? "-"}</td></tr>
                )) : <tr><td className="px-3 py-6 text-center text-muted-foreground" colSpan={4}>No row-level errors.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
