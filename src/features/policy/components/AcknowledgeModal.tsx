"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PolicyStatusBadge } from "./PolicyStatusBadge";
import { useAcknowledgePolicy } from "../hooks/usePolicies";
import type { Policy } from "../types/policy.types";

interface AcknowledgeModalProps {
  policy: Policy;
  readOnly?: boolean;
  onClose: () => void;
}

export function AcknowledgeModal({
  policy,
  readOnly = false,
  onClose,
}: AcknowledgeModalProps) {
  const [checked, setChecked] = useState(false);
  const acknowledgeMutation = useAcknowledgePolicy();

  const handleAcknowledge = () => {
    acknowledgeMutation.mutate(policy.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="max-w-2xl max-h-[85vh] flex flex-col"
        role="dialog"
        aria-labelledby="acknowledge-policy-title"
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle id="acknowledge-policy-title">
              {policy.title}
            </DialogTitle>
            <PolicyStatusBadge status={policy.status} />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto max-h-[60vh] mt-4 privacy-2">
          {policy.content ? (
            <div className="prose prose-sm max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: policy.content }}
                className="whitespace-pre-wrap text-sm leading-relaxed"
              />
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">
              No content available for this policy.
            </p>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-3 mt-4 pt-4 border-t">
          {!readOnly && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="ack-check"
                checked={checked}
                onCheckedChange={(val) => setChecked(val === true)}
                disabled={acknowledgeMutation.isPending}
              />
              <Label htmlFor="ack-check" className="text-sm cursor-pointer">
                I have read and understood this policy
              </Label>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            {!readOnly && (
              <Button
                onClick={handleAcknowledge}
                disabled={!checked || acknowledgeMutation.isPending}
              >
                {acknowledgeMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Confirming...
                  </span>
                ) : (
                  "Confirm Acknowledgement"
                )}
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          {acknowledgeMutation.isError && (
            <p className="text-sm text-destructive text-center">
              {(acknowledgeMutation.error as Error)?.message ??
                "Failed to acknowledge policy. Please try again."}
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
