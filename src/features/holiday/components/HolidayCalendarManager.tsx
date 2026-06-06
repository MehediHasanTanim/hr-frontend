"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToastStore } from "@/stores/toast.store";
import {
  useSetDefaultCalendarMutation,
} from "@/features/holiday/api/holidayApi";
import { HolidayCalendarList } from "@/features/holiday/components/HolidayCalendarList";
import { HolidayFormModal } from "@/features/holiday/components/HolidayFormModal";
import { HolidayList } from "@/features/holiday/components/HolidayList";
import type { Holiday, HolidayCalendar } from "@/features/leave/types";

export function HolidayCalendarManager() {
  const { addToast } = useToastStore();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [selectedCalendar, setSelectedCalendar] =
    useState<HolidayCalendar | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editHoliday, setEditHoliday] = useState<Holiday | null>(null);

  const setDefaultMutation = useSetDefaultCalendarMutation();

  function handleSelectCalendar(calendar: HolidayCalendar) {
    setSelectedCalendar(calendar);
  }

  function handleAddHoliday() {
    setEditHoliday(null);
    setShowFormModal(true);
  }

  function handleEditHoliday(holiday: Holiday) {
    setEditHoliday(holiday);
    setShowFormModal(true);
  }

  function handleSetDefault() {
    if (!selectedCalendar) return;
    setDefaultMutation.mutate(selectedCalendar.id, {
      onSuccess: () => {
        addToast({
          message: "Default calendar updated",
          variant: "success",
        });
      },
      onError: () => {
        addToast({
          message: "Failed to update default calendar",
          variant: "danger",
        });
      },
    });
  }

  return (
    <div className="flex gap-6">
      {/* Left panel */}
      <div className="w-[280px] shrink-0 space-y-4">
        <div>
          <label htmlFor="holiday-year" className="text-sm font-medium">
            Year
          </label>
          <select
            id="holiday-year"
            className="mt-1 h-7 w-full rounded-lg border border-input bg-background px-2 text-sm"
            value={year}
            onChange={(e) => {
              setYear(Number(e.target.value));
              setSelectedCalendar(null);
            }}
          >
            {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(
              (y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ),
            )}
          </select>
        </div>

        <HolidayCalendarList
          selectedId={selectedCalendar?.id ?? null}
          year={year}
          onSelect={handleSelectCalendar}
        />
      </div>

      <Separator orientation="vertical" className="h-auto" />

      {/* Right panel */}
      <div className="flex-1">
        {selectedCalendar ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div />
              <Button
                size="xs"
                type="button"
                variant="outline"
                disabled={selectedCalendar.isDefault}
                onClick={handleSetDefault}
              >
                {selectedCalendar.isDefault
                  ? "Default"
                  : "Set as Default"}
              </Button>
            </div>

            <HolidayList
              calendarId={selectedCalendar.id}
              calendarName={selectedCalendar.name}
              calendarYear={selectedCalendar.year}
              isDefault={selectedCalendar.isDefault}
              onAdd={handleAddHoliday}
              onEdit={handleEditHoliday}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center py-16 text-center text-sm text-muted-foreground">
            Select a holiday calendar to manage its holidays
          </div>
        )}
      </div>

      {/* Holiday Form Modal */}
      {selectedCalendar && (
        <HolidayFormModal
          open={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditHoliday(null);
          }}
          calendarId={selectedCalendar.id}
          editHoliday={editHoliday}
          existingHolidays={[]}
        />
      )}
    </div>
  );
}
