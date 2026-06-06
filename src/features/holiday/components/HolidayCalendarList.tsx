"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToastStore } from "@/stores/toast.store";
import {
  useCreateHolidayCalendarMutation,
  useHolidayCalendars,
} from "@/features/holiday/api/holidayApi";
import type { HolidayCalendar } from "@/features/leave/types";
import { cn } from "@/lib/utils";

export function HolidayCalendarList({
  selectedId,
  onSelect,
  year,
}: {
  selectedId: string | null;
  onSelect: (calendar: HolidayCalendar) => void;
  year: number;
}) {
  const { addToast } = useToastStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [calYear, setCalYear] = useState(year);
  const [isDefault, setIsDefault] = useState(false);

  const { data: calendars = [], isLoading } = useHolidayCalendars(year);
  const createMutation = useCreateHolidayCalendarMutation();

  function handleCreate() {
    if (!name.trim()) return;
    createMutation.mutate(
      {
        name: name.trim(),
        year: calYear,
        isDefault,
      },
      {
        onSuccess: (calendar) => {
          addToast({
            message: "Holiday calendar created",
            variant: "success",
          });
          setShowForm(false);
          setName("");
          setIsDefault(false);
          onSelect(calendar);
        },
        onError: () => {
          addToast({
            message: "Failed to create calendar",
            variant: "danger",
          });
        },
      },
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Holiday Calendars</h3>
        <Button
          size="xs"
          type="button"
          variant="outline"
          onClick={() => setShowForm(true)}
        >
          <Plus className="mr-1 size-3" />
          New Calendar
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="space-y-3 rounded-lg border p-3">
          <div className="space-y-1">
            <Label htmlFor="cal-name">Name</Label>
            <Input
              id="cal-name"
              className="h-7 text-xs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Calendar name"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cal-year">Year</Label>
            <select
              id="cal-year"
              className="h-7 w-full rounded-lg border border-input bg-background px-2 text-xs"
              value={calYear}
              onChange={(e) => setCalYear(Number(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => year - 2 + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs">
            <Switch
              checked={isDefault}
              onCheckedChange={setIsDefault}
            />
            Set as default
          </label>
          <div className="flex gap-2">
            <Button
              size="xs"
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              size="xs"
              type="button"
              disabled={createMutation.isPending || !name.trim()}
              onClick={handleCreate}
            >
              {createMutation.isPending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : calendars.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground">
          No calendars found
        </p>
      ) : (
        <div className="space-y-1">
          {calendars.map((calendar) => (
            <button
              key={calendar.id}
              type="button"
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-muted/30",
                selectedId === calendar.id &&
                  "border-l-4 border-l-primary bg-primary/5",
              )}
              onClick={() => onSelect(calendar)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{calendar.name}</span>
                {calendar.isDefault && (
                  <Badge variant="default" className="text-[10px]">
                    Default
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {calendar.year} · {calendar.holidays?.length ?? 0} holidays
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
