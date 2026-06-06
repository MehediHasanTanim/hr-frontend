"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToastStore } from "@/stores/toast.store";
import {
  useAttendanceExceptionsQuery,
  useAttendanceQuery,
  useCorrectAttendanceMutation,
} from "@/features/attendance/api/attendanceApi";
import type { AttendanceException, AttendanceRecord } from "@/features/attendance/types";
import { cn } from "@/lib/utils";

const correctionSchema = z
  .object({
    clockInAt: z.string().min(1, "Clock in time is required"),
    clockOutAt: z.string().min(1, "Clock out time is required"),
    reason: z.string().min(10, "Reason must be at least 10 characters"),
  })
  .refine(
    (data) => {
      if (data.clockInAt && data.clockOutAt) {
        return new Date(data.clockOutAt) > new Date(data.clockInAt);
      }
      return true;
    },
    { message: "Clock out must be after clock in", path: ["clockOutAt"] },
  );

type CorrectionFormValues = z.infer<typeof correctionSchema>;

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "present":
      return "default" as const;
    case "late":
      return "destructive" as const;
    case "half_day":
      return "secondary" as const;
    case "on_leave":
      return "secondary" as const;
    case "absent":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

function getExceptionBadgeVariant(type: string) {
  switch (type) {
    case "late":
      return "destructive" as const;
    case "absent":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

// Mock departments
const MOCK_DEPARTMENTS = [
  { id: "", name: "All Departments" },
  { id: "engineering", name: "Engineering" },
  { id: "hr", name: "HR" },
  { id: "marketing", name: "Marketing" },
];

export function AttendanceDashboard() {
  const { addToast } = useToastStore();
  const [tab, setTab] = useState<"grid" | "exceptions">("grid");
  const [selectedDate, setSelectedDate] = useState(
    () => format(new Date(), "yyyy-MM-dd"),
  );
  const [departmentId, setDepartmentId] = useState("");
  const [exceptionStartDate, setExceptionStartDate] = useState(
    () => format(new Date(), "yyyy-MM-dd"),
  );
  const [exceptionEndDate, setExceptionEndDate] = useState(
    () => format(new Date(), "yyyy-MM-dd"),
  );
  const [exceptionType, setExceptionType] = useState("");
  const [exceptionEmployeeSearch, setExceptionEmployeeSearch] = useState("");
  const [correctionRecord, setCorrectionRecord] = useState<AttendanceException | null>(null);
  const [dateRangeError, setDateRangeError] = useState("");

  const {
    data: attendanceRecords = [],
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useAttendanceQuery(selectedDate, departmentId || undefined);

  const {
    data: exceptions = [],
    isLoading: exceptionsLoading,
    error: exceptionsError,
  } = useAttendanceExceptionsQuery({
    startDate: exceptionStartDate,
    endDate: exceptionEndDate,
    type: exceptionType || undefined,
  });

  const correctMutation = useCorrectAttendanceMutation();

  const correctionForm = useForm<CorrectionFormValues>({
    resolver: zodResolver(correctionSchema),
    defaultValues: { clockInAt: "", clockOutAt: "", reason: "" },
  });

  // Check for yesterday's missing punches
  const yesterday = format(
    new Date(Date.now() - 86400000),
    "yyyy-MM-dd",
  );
  const missingPunchAlert = useMemo(() => {
    if (tab !== "grid") return null;
    return exceptions.filter(
      (e) => e.date === yesterday && e.type === "missing_punch",
    );
  }, [exceptions, yesterday, tab]);

  // Filtered exceptions
  const filteredExceptions = useMemo(() => {
    if (!exceptionEmployeeSearch.trim()) return exceptions;
    return exceptions.filter((e) =>
      e.employeeName
        .toLowerCase()
        .includes(exceptionEmployeeSearch.toLowerCase()),
    );
  }, [exceptions, exceptionEmployeeSearch]);

  function prevDay() {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() - 1);
    setSelectedDate(format(d, "yyyy-MM-dd"));
  }

  function nextDay() {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + 1);
    setSelectedDate(format(d, "yyyy-MM-dd"));
  }

  function handleExportCsv() {
    const params = new URLSearchParams({
      date: selectedDate,
      departmentId: departmentId || "",
    });
    window.open(
      `/api/v1/attendance/export?${params.toString()}`,
      "_blank",
    );
  }

  function handleExceptionDateChange(start: string, end: string) {
    setExceptionStartDate(start);
    setExceptionEndDate(end);
    const startD = new Date(start + "T00:00:00");
    const endD = new Date(end + "T00:00:00");
    const diff = Math.round(
      (endD.getTime() - startD.getTime()) / 86400000,
    );
    if (diff > 31) {
      setDateRangeError("Date range must not exceed 31 days");
    } else {
      setDateRangeError("");
    }
  }

  function openCorrectionModal(exception: AttendanceException) {
    setCorrectionRecord(exception);
    correctionForm.reset({
      clockInAt: "",
      clockOutAt: "",
      reason: "",
    });
  }

  function handleCorrectionSubmit(values: CorrectionFormValues) {
    if (!correctionRecord) return;
    correctMutation.mutate(
      {
        id: correctionRecord.employeeId,
        payload: {
          clockInAt: values.clockInAt,
          clockOutAt: values.clockOutAt,
          reason: values.reason,
        },
      },
      {
        onSuccess: () => {
          addToast({
            message: "Attendance record corrected",
            variant: "success",
          });
          setCorrectionRecord(null);
        },
        onError: () => {
          addToast({
            message: "Failed to correct attendance record",
            variant: "danger",
          });
        },
      },
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab selector */}
      <div className="flex gap-1 rounded-lg border p-0.5 w-fit">
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium transition-colors",
            tab === "grid"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setTab("grid")}
        >
          Daily Grid
        </button>
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium transition-colors",
            tab === "exceptions"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setTab("exceptions")}
        >
          Exception Report
        </button>
      </div>

      {/* Missing punch banner */}
      {missingPunchAlert && missingPunchAlert.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
          <AlertTriangle className="size-4 text-amber-600" />
          <p className="flex-1 text-amber-800">
            {missingPunchAlert.length} employee
            {missingPunchAlert.length !== 1 ? "s" : ""} have missing punches
            from yesterday —{" "}
            <button
              type="button"
              className="font-medium underline"
              onClick={() => {
                setTab("exceptions");
                setExceptionStartDate(yesterday);
                setExceptionEndDate(yesterday);
                setExceptionType("missing_punch");
              }}
            >
              Review now
            </button>
          </p>
        </div>
      )}

      {/* ─── Daily Grid Tab ─────────────────────────────── */}
      {tab === "grid" && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <Button
                size="icon-sm"
                type="button"
                variant="outline"
                onClick={prevDay}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div className="flex items-center gap-1">
                <Calendar className="size-4 text-muted-foreground" />
                <Input
                  className="h-7 w-40 text-xs"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <Button
                size="icon-sm"
                type="button"
                variant="outline"
                onClick={nextDay}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            <select
              aria-label="Department"
              className="h-7 rounded-lg border border-input bg-background px-2 text-sm"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              {MOCK_DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <Button size="sm" type="button" variant="outline" onClick={handleExportCsv}>
              Export CSV
            </Button>
          </div>

          {/* Card grid */}
          {attendanceLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <Skeleton className="mb-2 h-4 w-16" />
                  <Skeleton className="mb-1 size-10 rounded-full" />
                  <Skeleton className="mb-1 h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          ) : attendanceError ? (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm">
              <p className="text-destructive">Could not load attendance data</p>
            </div>
          ) : attendanceRecords.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No attendance records for this date
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {attendanceRecords.map((record: AttendanceRecord) => (
                <div
                  key={record.id}
                  className="flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center"
                >
                  <Badge variant={getStatusBadgeVariant(record.status)}>
                    {record.status === "missing_punch" ? (
                      <AlertTriangle className="mr-1 size-3" />
                    ) : null}
                    {record.status === "late"
                      ? "Late"
                      : record.status === "half_day"
                        ? "Half day"
                        : record.status === "on_leave"
                          ? "On leave"
                          : record.status === "absent"
                            ? "Absent"
                            : record.status === "missing_punch"
                              ? "Missing"
                              : "Present"}
                  </Badge>

                  <span className="grid size-10 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                    {record.employeeName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>

                  <p className="text-sm font-medium leading-tight">
                    {record.employeeName}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {record.clockInAt ? (
                      <>
                        {record.clockInAt.slice(11, 16)}
                        {" → "}
                        {record.clockOutAt ? (
                          record.clockOutAt.slice(11, 16)
                        ) : (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <span className="inline-block size-2 animate-pulse rounded-full bg-green-500" />
                            Active
                          </span>
                        )}
                      </>
                    ) : (
                      "–"
                    )}
                  </p>

                  {record.totalMinutes != null && (
                    <p className="text-xs text-muted-foreground">
                      {formatMinutes(record.totalMinutes)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Exception Report Tab ────────────────────────── */}
      {tab === "exceptions" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs">From</Label>
              <Input
                className="h-7 w-36 text-xs"
                type="date"
                value={exceptionStartDate}
                onChange={(e) =>
                  handleExceptionDateChange(e.target.value, exceptionEndDate)
                }
              />
              <Label className="text-xs">To</Label>
              <Input
                className="h-7 w-36 text-xs"
                type="date"
                value={exceptionEndDate}
                onChange={(e) =>
                  handleExceptionDateChange(exceptionStartDate, e.target.value)
                }
              />
            </div>

            <select
              aria-label="Exception type"
              className="h-7 rounded-lg border border-input bg-background px-2 text-sm"
              value={exceptionType}
              onChange={(e) => setExceptionType(e.target.value)}
            >
              <option value="">All types</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
              <option value="missing_punch">Missing punch</option>
            </select>

            <Input
              aria-label="Search employee"
              className="h-7 w-40 text-xs"
              placeholder="Search employee..."
              value={exceptionEmployeeSearch}
              onChange={(e) => setExceptionEmployeeSearch(e.target.value)}
            />
          </div>

          {dateRangeError && (
            <p className="text-sm text-destructive">{dateRangeError}</p>
          )}

          {/* Exceptions table */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Employee</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Exception Type</th>
                  <th className="px-3 py-2">Detail</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {exceptionsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-3 py-3" colSpan={5}>
                        <Skeleton className="h-5 w-full" />
                      </td>
                    </tr>
                  ))
                ) : exceptionsError ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-destructive" colSpan={5}>
                      Could not load exceptions
                    </td>
                  </tr>
                ) : filteredExceptions.length === 0 ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-muted-foreground" colSpan={5}>
                      No exceptions found
                    </td>
                  </tr>
                ) : (
                  filteredExceptions.map((exception: AttendanceException, idx: number) => (
                    <tr key={`${exception.employeeId}-${exception.date}-${idx}`} className="hover:bg-muted/20">
                      <td className="px-3 py-3 font-medium">
                        {exception.employeeName}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {format(
                          new Date(exception.date + "T00:00:00"),
                          "d MMM yyyy",
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={getExceptionBadgeVariant(exception.type)}>
                          {exception.type === "late"
                            ? "Late"
                            : exception.type === "absent"
                              ? "Absent"
                              : "Missing punch"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 max-w-[200px] truncate text-muted-foreground">
                        {exception.detail}
                      </td>
                      <td className="px-3 py-3 text-right">
                        {exception.type === "missing_punch" ? (
                          <Button
                            size="sm"
                            type="button"
                            variant="outline"
                            onClick={() => openCorrectionModal(exception)}
                          >
                            Correct
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            type="button"
                            variant="ghost"
                            onClick={() => openCorrectionModal(exception)}
                          >
                            View
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Correction Modal ───────────────────────────── */}
      <Dialog
        open={Boolean(correctionRecord)}
        onOpenChange={(open) => {
          if (!open) setCorrectionRecord(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Correct Attendance Record</DialogTitle>
          </DialogHeader>

          {correctionRecord && (
            <form
              className="space-y-4"
              onSubmit={correctionForm.handleSubmit(handleCorrectionSubmit)}
            >
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="font-medium">{correctionRecord.employeeName}</p>
                <p className="text-sm text-muted-foreground">
                  {format(
                    new Date(correctionRecord.date + "T00:00:00"),
                    "d MMM yyyy",
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clockInAt">Clock In Time</Label>
                <Controller
                  name="clockInAt"
                  control={correctionForm.control}
                  render={({ field }) => (
                    <Input
                      id="clockInAt"
                      type="datetime-local"
                      aria-invalid={Boolean(
                        correctionForm.formState.errors.clockInAt,
                      )}
                      {...field}
                    />
                  )}
                />
                {correctionForm.formState.errors.clockInAt?.message && (
                  <p className="text-sm text-destructive">
                    {correctionForm.formState.errors.clockInAt.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clockOutAt">Clock Out Time</Label>
                <Controller
                  name="clockOutAt"
                  control={correctionForm.control}
                  render={({ field }) => (
                    <Input
                      id="clockOutAt"
                      type="datetime-local"
                      aria-invalid={Boolean(
                        correctionForm.formState.errors.clockOutAt,
                      )}
                      {...field}
                    />
                  )}
                />
                {correctionForm.formState.errors.clockOutAt?.message && (
                  <p className="text-sm text-destructive">
                    {correctionForm.formState.errors.clockOutAt.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="correctionReason">Reason</Label>
                <Controller
                  name="reason"
                  control={correctionForm.control}
                  render={({ field }) => (
                    <textarea
                      id="correctionReason"
                      rows={3}
                      maxLength={500}
                      className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      {...field}
                    />
                  )}
                />
                {correctionForm.formState.errors.reason?.message && (
                  <p className="text-sm text-destructive">
                    {correctionForm.formState.errors.reason.message}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCorrectionRecord(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={correctMutation.isPending}
                >
                  {correctMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Correction"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
