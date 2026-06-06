"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLeaveCalendar } from "@/features/leave/api/leaveApi";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function hashColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 55%, 45%)`;
}

// Mock departments data (can be replaced with actual hook)
const MOCK_DEPARTMENTS = [
  { id: "", name: "All Departments" },
  { id: "engineering", name: "Engineering" },
  { id: "hr", name: "HR" },
  { id: "marketing", name: "Marketing" },
];

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isHoliday: boolean;
  holidayName?: string;
  leaves: Array<{
    employeeId: string;
    employeeName: string;
    leaveType: string;
    status: string;
    startDate: string;
    endDate: string;
    totalDays: number;
  }>;
}

export function TeamLeaveCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [departmentId, setDepartmentId] = useState("");
  const [showMoreDay, setShowMoreDay] = useState<CalendarDay | null>(null);

  const { data: calendarData, isLoading } = useLeaveCalendar({
    year,
    month,
    departmentId: departmentId || undefined,
  });

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();

    // Monday-based start (0 = Monday in our system)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const days: CalendarDay[] = [];

    // Previous month fillers
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, -i);
      days.push({
        date: d,
        day: d.getDate(),
        isCurrentMonth: false,
        isToday: false,
        isHoliday: false,
        leaves: [],
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const today = new Date();
      const isToday =
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();

      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayData = calendarData?.[dateStr];
      const leaves = dayData?.leaves ?? [];
      const isHoliday = dayData?.isHoliday ?? false;
      const holidayName = dayData?.holidayName;

      days.push({
        date,
        day,
        isCurrentMonth: true,
        isToday,
        isHoliday,
        holidayName,
        leaves: leaves.map((l: Record<string, unknown>) => ({
          employeeId: String(l.employeeId ?? ""),
          employeeName: String(l.employeeName ?? ""),
          leaveType: String(l.leaveType ?? ""),
          status: String(l.status ?? ""),
          startDate: String(l.startDate ?? ""),
          endDate: String(l.endDate ?? ""),
          totalDays: Number(l.totalDays ?? 0),
        })),
      });
    }

    // Next month fillers
    const remaining = 7 - (days.length % 7 || 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month, i);
        days.push({
          date: d,
          day: i,
          isCurrentMonth: false,
          isToday: false,
          isHoliday: false,
          leaves: [],
        });
      }
    }

    return days;
  }, [year, month, calendarData]);

  const weeks = useMemo(() => {
    const result: CalendarDay[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  function prevMonth() {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function goToToday() {
    const d = new Date();
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  }

  const hasConflict = (leaves: CalendarDay["leaves"]) => {
    const activeLeaves = leaves.filter(
      (l) => l.status === "approved" || l.status === "pending",
    );
    return activeLeaves.length >= 3;
  };

  const visibleLeaves = (leaves: CalendarDay["leaves"]) => leaves.slice(0, 3);
  const extraLeaves = (leaves: CalendarDay["leaves"]) => leaves.slice(3);

  const toggleShowMore = (day: CalendarDay) => {
    setShowMoreDay(showMoreDay?.date.getTime() === day.date.getTime() ? null : day);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <Button size="icon-sm" type="button" variant="outline" onClick={prevMonth}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[140px] text-center text-sm font-medium">
              {new Date(year, month - 1).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <Button size="icon-sm" type="button" variant="outline" onClick={nextMonth}>
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <Button size="sm" type="button" variant="outline" onClick={goToToday}>
            Today
          </Button>

          <select
            aria-label="Department filter"
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
        </div>

        {/* Calendar Grid */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/60">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          )}

          {/* Mobile list view (below 768px) */}
          <div className="space-y-2 md:hidden">
            {weeks.flat().filter(d => d.isCurrentMonth).map((day) => (
              <div key={day.date.toISOString()} className="rounded-lg border p-3">
                <p className="text-sm font-medium">
                  {day.date.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                {day.isHoliday && (
                  <p className="mt-1 text-xs text-amber-600">{day.holidayName}</p>
                )}
                {day.leaves.length === 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">No leaves</p>
                )}
                {day.leaves.map((leave) => (
                  <div
                    key={`${leave.employeeId}-${leave.leaveType}`}
                    className={cn(
                      "mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs",
                      leave.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-700",
                    )}
                  >
                    <span
                      className="inline-block size-3 rounded-full"
                      style={{ backgroundColor: hashColor(leave.employeeId) }}
                    />
                    <span>{leave.employeeName.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Desktop calendar grid */}
          <div className="hidden md:block">
            {/* Header row */}
            <div className="grid grid-cols-7 border-b text-center text-xs font-medium text-muted-foreground">
              {DAY_NAMES.map((name) => (
                <div key={name} className="border-r py-2 last:border-r-0">
                  {name}
                </div>
              ))}
            </div>

            {/* Week rows */}
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7">
                {week.map((day) => (
                  <div
                    key={day.date.toISOString()}
                    className={cn(
                      "relative flex min-h-[100px] flex-col border-b border-r p-1.5 last:border-r-0",
                      !day.isCurrentMonth && "bg-muted/20",
                      day.isToday && "ring-1 ring-inset ring-primary/30",
                      day.isHoliday && "bg-amber-50/40",
                      hasConflict(day.leaves) && "bg-destructive/5",
                    )}
                  >
                    {/* Warning icon for conflicts */}
                    {hasConflict(day.leaves) && (
                      <AlertTriangle className="absolute left-1 top-1 size-3.5 text-destructive" />
                    )}

                    {/* Date number */}
                    <span
                      className={cn(
                        "ml-auto text-xs",
                        day.isToday && "flex size-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground",
                        !day.isCurrentMonth && "text-muted-foreground/50",
                      )}
                    >
                      {day.day}
                    </span>

                    {/* Holiday marker */}
                    {day.isHoliday && day.holidayName && (
                      <span className="mb-0.5 truncate rounded-sm bg-amber-100 px-1 text-[10px] text-amber-700">
                        {day.holidayName.length > 12
                          ? day.holidayName.slice(0, 12) + "…"
                          : day.holidayName}
                      </span>
                    )}

                    {/* Leave pills */}
                    <div className="flex flex-col gap-0.5">
                      {visibleLeaves(day.leaves).map((leave) => (
                        <Tooltip key={`${leave.employeeId}-${leave.leaveType}`}>
                          <TooltipTrigger asChild>
                            <span
                              className={cn(
                                "inline-flex cursor-default items-center gap-1 rounded-sm px-1 py-0.5 text-[11px] leading-tight",
                                leave.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-700",
                              )}
                            >
                              <span
                                className="inline-block size-2.5 shrink-0 rounded-full"
                                style={{
                                  backgroundColor: hashColor(leave.employeeId),
                                }}
                              />
                              <span className="truncate">
                                {leave.employeeName.split(" ")[0].length > 8
                                  ? leave.employeeName.split(" ")[0].slice(0, 8) + "…"
                                  : leave.employeeName.split(" ")[0]}
                              </span>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{leave.employeeName}</p>
                            <p>
                              {leave.leaveType} · {leave.startDate} – {leave.endDate}
                            </p>
                            <p>
                              {leave.totalDays} day{leave.totalDays !== 1 ? "s" : ""} ·{" "}
                              {leave.status}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                      {extraLeaves(day.leaves).length > 0 && (
                        <button
                          type="button"
                          className="text-left text-[11px] text-primary hover:underline"
                          onClick={() => toggleShowMore(day)}
                        >
                          +{extraLeaves(day.leaves).length} more
                        </button>
                      )}
                    </div>

                    {/* Show more popover */}
                    {showMoreDay?.date.getTime() === day.date.getTime() &&
                      extraLeaves(day.leaves).length > 0 && (
                        <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border bg-popover p-2 shadow-md">
                          <p className="mb-1 text-xs font-medium text-muted-foreground">
                            All leaves for {day.date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          {day.leaves.map((leave) => (
                            <div
                              key={`${leave.employeeId}-${leave.leaveType}`}
                              className="flex items-center gap-2 py-1 text-xs"
                            >
                              <span
                                className="inline-block size-2.5 rounded-full"
                                style={{
                                  backgroundColor: hashColor(leave.employeeId),
                                }}
                              />
                              <span className="font-medium">{leave.employeeName}</span>
                              <span
                                className={cn(
                                  "ml-auto rounded-sm px-1 text-[10px]",
                                  leave.status === "approved"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-600",
                                )}
                              >
                                {leave.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
