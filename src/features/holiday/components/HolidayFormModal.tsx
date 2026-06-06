"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { z } from "zod";

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
import { useToastStore } from "@/stores/toast.store";
import {
  useCreateHolidayMutation,
  useDeleteHolidayMutation,
  useUpdateHolidayMutation,
} from "@/features/holiday/api/holidayApi";
import type { Holiday, HolidayType } from "@/features/leave/types";
import { cn } from "@/lib/utils";

const holidayFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  type: z.enum(["public", "optional", "restricted"]),
});

type HolidayFormValues = z.infer<typeof holidayFormSchema>;

export function HolidayFormModal({
  open,
  onClose,
  calendarId,
  editHoliday,
  existingHolidays,
}: {
  open: boolean;
  onClose: () => void;
  calendarId: string;
  editHoliday?: Holiday | null;
  existingHolidays: Holiday[];
}) {
  const { addToast } = useToastStore();
  const isEdit = Boolean(editHoliday);

  const createMutation = useCreateHolidayMutation(calendarId);
  const updateMutation = useUpdateHolidayMutation(calendarId);
  const deleteMutation = useDeleteHolidayMutation(calendarId);

  const form = useForm<HolidayFormValues>({
    resolver: zodResolver(holidayFormSchema),
    defaultValues: { date: "", name: "", type: "public" },
  });

  useEffect(() => {
    if (editHoliday) {
      form.reset({
        date: editHoliday.date,
        name: editHoliday.name,
        type: editHoliday.type as HolidayType,
      });
    } else {
      form.reset({ date: "", name: "", type: "public" });
    }
  }, [editHoliday, form]);

  const selectedDate = form.watch("date");
  const duplicateDate = useMemo(() => {
    if (!selectedDate || isEdit) return false;
    return existingHolidays.some((h) => h.date === selectedDate);
  }, [selectedDate, existingHolidays, isEdit]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(values: HolidayFormValues) {
    if (duplicateDate) return;

    if (isEdit && editHoliday) {
      updateMutation.mutate(
        { id: editHoliday.id, payload: values },
        {
          onSuccess: () => {
            addToast({ message: "Holiday updated", variant: "success" });
            onClose();
          },
          onError: () => {
            addToast({ message: "Failed to update holiday", variant: "danger" });
          },
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          addToast({ message: "Holiday added", variant: "success" });
          onClose();
        },
        onError: () => {
          addToast({ message: "Failed to add holiday", variant: "danger" });
        },
      });
    }
  }

  function handleDelete() {
    if (!editHoliday) return;
    if (!window.confirm(`Delete ${editHoliday.name}? This cannot be undone.`)) {
      return;
    }
    deleteMutation.mutate(editHoliday.id, {
      onSuccess: () => {
        addToast({ message: "Holiday deleted", variant: "success" });
        onClose();
      },
      onError: () => {
        addToast({ message: "Failed to delete holiday", variant: "danger" });
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Holiday" : "Add Holiday"}</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="holiday-date">Date</Label>
            <Controller
              name="date"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="holiday-date"
                  type="date"
                  aria-invalid={Boolean(form.formState.errors.date)}
                  {...field}
                />
              )}
            />
            {form.formState.errors.date?.message && (
              <p className="text-sm text-destructive">
                {form.formState.errors.date.message}
              </p>
            )}
            {duplicateDate && (
              <p className="text-sm text-destructive">
                A holiday already exists on this date
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="holiday-name">Name</Label>
            <Controller
              name="name"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="holiday-name"
                  maxLength={100}
                  aria-invalid={Boolean(form.formState.errors.name)}
                  {...field}
                />
              )}
            />
            {form.formState.errors.name?.message && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Controller
              name="type"
              control={form.control}
              render={({ field }) => (
                <div
                  className="flex rounded-lg border border-input p-0.5"
                  role="radiogroup"
                  aria-label="Holiday type"
                >
                  {(["public", "optional", "restricted"] as const).map(
                    (option) => (
                      <button
                        key={option}
                        type="button"
                        role="radio"
                        aria-checked={field.value === option}
                        className={cn(
                          "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                          field.value === option
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                        onClick={() => field.onChange(option)}
                      >
                        {option === "public"
                          ? "Public"
                          : option === "optional"
                            ? "Optional"
                            : "Restricted"}
                      </button>
                    ),
                  )}
                </div>
              )}
            />
          </div>

          <DialogFooter>
            {isEdit && (
              <Button
                type="button"
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={handleDelete}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || duplicateDate}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Add Holiday"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
