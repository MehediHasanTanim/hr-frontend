// src/features/expenses/components/ReceiptUploadField.tsx
// Sprint 10 F6 — Receipt upload field (S3 direct-upload pattern)
// §8: reuses existing document upload pattern from earlier sprints.

"use client";

import React, { useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReceiptUploadFieldProps {
  value: string; // S3 key
  onChange: (s3Key: string) => void;
  error?: string;
  disabled?: boolean;
}

// Placeholder S3 upload — replace with the shared useS3Upload hook
// from an earlier sprint when confirmed.
async function mockUpload(file: File): Promise<{ s3Key: string }> {
  // In production: const { upload } = useS3Upload(); return upload(file);
  return { s3Key: `receipts/${Date.now()}-${file.name}` };
}

export function ReceiptUploadField({
  value,
  onChange,
  error,
  disabled = false,
}: ReceiptUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);
    try {
      const result = await mockUpload(file);
      onChange(result.s3Key);
    } catch {
      onChange("");
      setFileName(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    onChange("");
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div data-testid="receipt-upload-field">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        data-testid="receipt-file-input"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {value ? (
        <div className="flex items-center justify-between rounded-md border p-3">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{fileName ?? "Receipt uploaded"}</span>
            <span className="text-xs text-green-600 font-medium">
              ✓ Uploaded
            </span>
          </div>
          <button
            type="button"
            data-testid="clear-receipt-btn"
            onClick={handleClear}
            disabled={disabled}
            className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Remove receipt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          data-testid="upload-receipt-btn"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
          className={cn(
            "w-full rounded-lg border-2 border-dashed border-muted-foreground/30 p-6 text-center",
            "hover:border-primary hover:text-primary disabled:opacity-50 transition-colors",
          )}
        >
          <Upload className="mx-auto h-6 w-6 mb-1" />
          <span className="text-sm font-medium">
            {isUploading ? "Uploading..." : "Upload Receipt"}
          </span>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, or PDF up to 5 MB
          </p>
        </button>
      )}

      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
