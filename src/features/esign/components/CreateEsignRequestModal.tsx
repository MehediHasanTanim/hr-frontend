"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateEsignRequest } from "../hooks/useEsignRequests";

const createEsignSchema = z.object({
  documentId: z.string().uuid("Select a document"),
  signerEmployeeId: z.string().uuid("Select a signer"),
});

type CreateEsignFormValues = z.infer<typeof createEsignSchema>;

interface CreateEsignRequestModalProps {
  onClose: () => void;
}

export function CreateEsignRequestModal({
  onClose,
}: CreateEsignRequestModalProps) {
  const createMutation = useCreateEsignRequest();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<CreateEsignFormValues>({
    resolver: zodResolver(createEsignSchema),
  });

  const onSubmit = (data: CreateEsignFormValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        onClose();
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.message ??
          error?.response?.data?.detail ??
          "Failed to create eSign request";
        setError("documentId", { message });
      },
    });
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md" role="dialog" aria-labelledby="create-esign-title">
        <DialogHeader>
          <DialogTitle id="create-esign-title">
            Create eSign Request
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="documentId">Document ID</Label>
            <Input
              id="documentId"
              {...register("documentId")}
              placeholder="Enter document UUID"
            />
            {errors.documentId && (
              <p className="text-xs text-destructive mt-1">
                {errors.documentId.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="signerEmployeeId">Signer Employee ID</Label>
            <Input
              id="signerEmployeeId"
              {...register("signerEmployeeId")}
              placeholder="Enter employee UUID"
            />
            {errors.signerEmployeeId && (
              <p className="text-xs text-destructive mt-1">
                {errors.signerEmployeeId.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full"
            >
              {createMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create Request"
              )}
            </Button>
          </DialogFooter>

          {createMutation.isError && (
            <p className="text-sm text-destructive text-center">
              {(createMutation.error as Error)?.message ??
                "Failed to create request. Please try again."}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
