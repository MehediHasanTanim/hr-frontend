"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToastStore } from "@/stores/toast.store";
import { useDeclineEsign } from "../hooks/useEsignRequests";

const declineSchema = z.object({
  reason: z.string().max(500).optional(),
});

type DeclineFormValues = z.infer<typeof declineSchema>;

interface DeclineModalProps {
  requestId: string;
  onClose: () => void;
}

export function DeclineModal({ requestId, onClose }: DeclineModalProps) {
  const declineMutation = useDeclineEsign();
  const addToast = useToastStore((s) => s.addToast);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeclineFormValues>({
    resolver: zodResolver(declineSchema),
  });

  const onSubmit = (data: DeclineFormValues) => {
    declineMutation.mutate(
      { requestId, payload: { reason: data.reason } },
      {
        onSuccess: () => {
          addToast({
            message: "eSign request declined",
            variant: "success",
            duration: 3000,
          });
          onClose();
        },
        onError: () => {
          addToast({
            message: "Failed to decline. Please try again.",
            variant: "danger",
            duration: 3000,
          });
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md" role="dialog" aria-labelledby="decline-esign-title">
        <DialogHeader>
          <DialogTitle id="decline-esign-title">
            Decline Signature Request
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="decline-reason">Reason (optional)</Label>
            <textarea
              id="decline-reason"
              {...register("reason")}
              rows={3}
              maxLength={500}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Provide a reason for declining..."
            />
            {errors.reason && (
              <p className="text-xs text-destructive mt-1">
                {errors.reason.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={declineMutation.isPending}
            >
              {declineMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Declining...
                </span>
              ) : (
                "Confirm Decline"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
