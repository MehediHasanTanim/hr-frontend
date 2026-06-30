"use client";

import { useState, useRef, useCallback } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToastStore } from "@/stores/toast.store";
import { useEsignRequest, useSignDocument, useDeclineEsign } from "../hooks/useEsignRequests";
import { useSignedUrl } from "@/features/documents/hooks/useDocuments";
import { SignaturePad } from "./SignaturePad";
import { DeclineModal } from "./DeclineModal";

interface SignerViewProps {
  requestId: string;
}

export function SignerView({ requestId }: SignerViewProps) {
  const { data: esignRequest, isLoading, isError } = useEsignRequest(requestId);
  const signMutation = useSignDocument();
  const addToast = useToastStore((s) => s.addToast);

  const [signatureMode, setSignatureMode] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState("");
  const [signatureDataUri, setSignatureDataUri] = useState<string | null>(null);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const typeCanvasRef = useRef<HTMLCanvasElement>(null);

  const { data: signedUrlData, isLoading: signedUrlLoading } = useSignedUrl(
    esignRequest?.documentId ?? "",
  );

  const handleSignatureChange = useCallback((dataUri: string | null) => {
    setSignatureDataUri(dataUri);
  }, []);

  const handleTypedNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.value;
      setTypedName(name);

      if (name && typeCanvasRef.current) {
        const canvas = typeCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.font = "32px 'Dancing Script', cursive";
          ctx.fillStyle = "#000000";
          ctx.textAlign = "center";
          ctx.fillText(name, canvas.width / 2, canvas.height / 2 + 10);
          setSignatureDataUri(canvas.toDataURL("image/png"));
        }
      } else {
        setSignatureDataUri(null);
      }
    },
    [],
  );

  const handleSign = () => {
    if (!signatureDataUri) return;
    signMutation.mutate(
      { requestId, payload: { base64Signature: signatureDataUri } },
      {
        onSuccess: () => {
          addToast({
            message: "Document signed ✓",
            variant: "success",
            duration: 3000,
          });
        },
        onError: (error: any) => {
          if (error?.response?.status === 410) {
            addToast({
              message: "This request has expired",
              variant: "danger",
              duration: 3000,
            });
          } else {
            addToast({
              message: "Failed to sign document. Please try again.",
              variant: "danger",
              duration: 3000,
            });
          }
        },
      },
    );
  };

  const clearSignature = () => {
    setSignatureDataUri(null);
    setTypedName("");
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !esignRequest) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load eSign request.</p>
      </div>
    );
  }

  const isPending = esignRequest.status === "PENDING";
  const isSigned = esignRequest.status === "SIGNED";
  const isDeclined = esignRequest.status === "DECLINED";
  const isExpired = esignRequest.status === "EXPIRED";

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      {/* Status Banner */}
      {isPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="size-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-amber-800">
              This document is awaiting your signature.
            </p>
            <p className="text-sm text-amber-700">
              Expires{" "}
              {formatDistanceToNow(new Date(esignRequest.expiresAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      )}
      {isSigned && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="size-5 text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-green-800">
              You signed this document on{" "}
              {esignRequest.signedAt &&
                format(new Date(esignRequest.signedAt), "PPP")}
            </p>
          </div>
        </div>
      )}
      {isDeclined && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <XCircle className="size-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-red-800">
              You declined this request.
            </p>
            <p className="text-sm text-red-700">
              Reason: {esignRequest.declineReason ?? "None provided"}
            </p>
          </div>
        </div>
      )}
      {isExpired && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-3">
          <Clock className="size-5 text-gray-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-gray-800">
              This request has expired.
            </p>
          </div>
        </div>
      )}

      {/* Document Preview */}
      <div className="border rounded-lg overflow-hidden">
        {signedUrlLoading ? (
          <Skeleton className="h-[60vh] w-full" />
        ) : signedUrlData?.signedUrl ? (
          <iframe
            src={signedUrlData.signedUrl}
            className="w-full h-[60vh]"
            title="Document preview"
          />
        ) : (
          <div className="flex items-center justify-center h-[40vh] bg-muted/30">
            <p className="text-muted-foreground">
              Unable to preview document — download to view
            </p>
          </div>
        )}
      </div>

      {/* Signature Section (only when PENDING) */}
      {isPending && (
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold">Your Signature</h3>

          <div className="flex gap-2 border-b pb-2">
            <Button
              size="sm"
              variant={signatureMode === "draw" ? "default" : "ghost"}
              onClick={() => setSignatureMode("draw")}
            >
              Draw
            </Button>
            <Button
              size="sm"
              variant={signatureMode === "type" ? "default" : "ghost"}
              onClick={() => setSignatureMode("type")}
            >
              Type
            </Button>
          </div>

          {signatureMode === "draw" && (
            <SignaturePad onChange={handleSignatureChange} />
          )}

          {signatureMode === "type" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Type your full name"
                value={typedName}
                onChange={handleTypedNameChange}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                style={{ fontFamily: "'Dancing Script', cursive" }}
              />
              <canvas
                ref={typeCanvasRef}
                width={400}
                height={160}
                className="w-full border border-gray-300 rounded-lg bg-white hidden"
              />
              {typedName && (
                <div
                  className="w-full border border-gray-300 rounded-lg bg-white p-4 flex items-center justify-center"
                  style={{ fontFamily: "'Dancing Script', cursive" }}
                >
                  <span className="text-3xl">{typedName}</span>
                </div>
              )}
            </div>
          )}

          {signatureDataUri && (
            <button
              type="button"
              onClick={clearSignature}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Clear
            </button>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSign}
              disabled={!signatureDataUri || signMutation.isPending}
              className="flex-1"
            >
              {signMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Signing...
                </span>
              ) : (
                "Sign Document"
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowDeclineModal(true)}
            >
              Decline
            </Button>
          </div>
        </div>
      )}

      {/* Integrity Notice */}
      {isSigned && esignRequest.documentSha256AtSign && (
        <div className="text-xs text-muted-foreground bg-muted/30 rounded p-3 text-center">
          Document integrity verified. SHA-256:{" "}
          {esignRequest.documentSha256AtSign.slice(0, 16)}...
        </div>
      )}

      {showDeclineModal && (
        <DeclineModal
          requestId={requestId}
          onClose={() => setShowDeclineModal(false)}
        />
      )}
    </div>
  );
}
