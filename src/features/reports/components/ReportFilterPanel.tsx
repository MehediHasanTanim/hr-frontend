// src/features/reports/components/ReportFilterPanel.tsx
// Sprint 6 — Dynamic report filter panel (fields depend on selected report key)

"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reportFilterSchema, type ReportFilters as TReportFilters } from "../schemas/report-filter.schema";
import type { ReportKey } from "@/types/report.types";
import { Loader2 } from "lucide-react";

interface Department {
  id: string;
  name: string;
}

interface ReportFilterPanelProps {
  reportKey: ReportKey;
  filters: TReportFilters;
  departments: Department[];
  onFiltersChange: (f: TReportFilters) => void;
  onRun: () => void;
  isRunning: boolean;
}

const dateFields: ReportKey[] = [
  "headcount", "attrition", "payroll_summary", "leave_utilization",
  "attendance_summary", "new_hires", "exits",
];
const deptFields: ReportKey[] = [
  "headcount", "attrition", "payroll_summary", "attendance_summary", "new_hires", "exits",
];
const leaveTypeFields: ReportKey[] = ["leave_utilization"];
const periodFields: ReportKey[] = ["payroll_summary"];

export function ReportFilterPanel({
  reportKey,
  filters,
  departments,
  onFiltersChange,
  onRun,
  isRunning,
}: ReportFilterPanelProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TReportFilters>({
    resolver: zodResolver(reportFilterSchema),
    values: filters,
  });

  const showDates = dateFields.includes(reportKey);
  const showDept = deptFields.includes(reportKey);
  const showLeaveType = leaveTypeFields.includes(reportKey);
  const showPeriod = periodFields.includes(reportKey);

  function onSubmit(data: TReportFilters) {
    onFiltersChange(data);
    onRun();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="report-filter-panel">
      <h3 className="text-sm font-semibold text-muted-foreground">Filters</h3>

      {showDates && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              {...register("startDate")}
              aria-invalid={!!errors.startDate}
              data-testid="filter-start-date"
            />
            {errors.startDate && (
              <p className="text-xs text-red-500" role="alert">
                {errors.startDate.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              {...register("endDate")}
              aria-invalid={!!errors.endDate}
              data-testid="filter-end-date"
            />
            {errors.endDate && (
              <p className="text-xs text-red-500" role="alert">
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>
      )}

      {showDept && (
        <div className="space-y-1">
          <Label htmlFor="departmentId">Department</Label>
          <Select
            value={filters.departmentId ?? ""}
            onValueChange={(v) => {
              setValue("departmentId", v || undefined);
              onFiltersChange({ ...filters, departmentId: v || undefined });
            }}
          >
            <SelectTrigger data-testid="filter-department">
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showLeaveType && (
        <div className="space-y-1">
          <Label htmlFor="leaveType">Leave Type</Label>
          <Select
            value={filters.leaveType ?? ""}
            onValueChange={(v) => {
              setValue("leaveType", v || undefined);
              onFiltersChange({ ...filters, leaveType: v || undefined });
            }}
          >
            <SelectTrigger data-testid="filter-leave-type">
              <SelectValue placeholder="All leave types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="ANNUAL">Annual</SelectItem>
              <SelectItem value="SICK">Sick</SelectItem>
              <SelectItem value="CASUAL">Casual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {showPeriod && (
        <div className="space-y-1">
          <Label htmlFor="payrollPeriod">Payroll Period</Label>
          <Input
            id="payrollPeriod"
            type="month"
            {...register("payrollPeriod")}
            data-testid="filter-payroll-period"
          />
        </div>
      )}

      <Button
        type="submit"
        disabled={isRunning || Object.keys(errors).length > 0}
        className="w-full"
        data-testid="run-report-btn"
      >
        {isRunning ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Running…
          </>
        ) : (
          "Run Report"
        )}
      </Button>
    </form>
  );
}
