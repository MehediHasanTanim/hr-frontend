// src/features/performance/components/CheckInDrawer.tsx
// Sprint 8 F2 — Check-in drawer for goal progress updates

"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, History } from "lucide-react";
import { useGoalCheckIns, usePostCheckIn } from "../api/okr";
import type { Goal } from "@/types/performance";

const checkInSchema = z.object({
  note: z.string().min(1, 'Note is required').max(1000),
  value: z.number().min(0).optional(),
});

interface CheckInDrawerProps {
  goal: Goal;
  open: boolean;
  onClose: () => void;
}

export function CheckInDrawer({ goal, open, onClose }: CheckInDrawerProps) {
  const { data: checkIns, isLoading } = useGoalCheckIns(open ? goal.id : '');
  const postCheckIn = usePostCheckIn();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkInSchema),
    defaultValues: { note: '', value: undefined },
  });

  function onSubmit(data: { note: string; value?: number }) {
    postCheckIn.mutate(
      { goalId: goal.id, note: data.note, value: data.value },
      { onSuccess: () => reset() },
    );
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-base">{goal.title}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto py-4">
          {/* Check-in history */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-1 text-sm font-semibold">
              <History className="h-4 w-4" />
              Check-in History
            </h4>
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : checkIns && checkIns.length > 0 ? (
              <div className="space-y-2">
                {checkIns.map((ci) => (
                  <div key={ci.id} className="rounded-lg border p-2 text-sm" data-testid={`checkin-${ci.id}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{ci.postedByName ?? ci.postedBy}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(ci.createdAt).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{ci.note}</p>
                    {ci.valueAtCheckIn !== null && (
                      <span className="text-xs tabular-nums">Value: {ci.valueAtCheckIn}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No check-ins yet.</p>
            )}
          </div>

          {/* New check-in form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 border-t pt-4">
            <h4 className="text-sm font-semibold">New Check-in</h4>
            <div className="space-y-1">
              <Label htmlFor="checkin-note">Progress Note *</Label>
              <Textarea
                id="checkin-note"
                {...register('note')}
                rows={3}
                placeholder="What progress has been made?"
                data-testid="checkin-note"
                aria-invalid={!!errors.note}
              />
              {errors.note && <p className="text-xs text-red-500">{errors.note.message}</p>}
            </div>
            {goal.goalType === 'key_result' && (
              <div className="space-y-1">
                <Label htmlFor="checkin-value">Current Value</Label>
                <Input
                  id="checkin-value"
                  type="number"
                  min={0}
                  {...register('value', { valueAsNumber: true })}
                  placeholder={`0${goal.unit ? ` ${goal.unit}` : ''}`}
                  data-testid="checkin-value"
                />
              </div>
            )}
            <Button type="submit" disabled={postCheckIn.isPending} className="w-full" data-testid="submit-checkin">
              {postCheckIn.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post Check-in
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
