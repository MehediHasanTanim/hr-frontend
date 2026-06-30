"use client";

import { useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUploadDocument } from "../hooks/useDocuments";

const uploadSchema = z.object({
  category: z.enum(["CONTRACT", "NID", "CERTIFICATE", "PAYSLIP", "OTHER"]),
  description: z.string().max(255).optional(),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

interface DocumentUploadDropzoneProps {
  employeeId: string;
  onSuccess?: () => void;
}

export function DocumentUploadDropzone({
  employeeId,
  onSuccess,
}: DocumentUploadDropzoneProps) {
  const uploadMutation = useUploadDocument(employeeId);
  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { category: "OTHER", description: "" },
  });

  const fileWatch = watch("file" as never) as File | undefined;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        if (file.size > MAX_FILE_SIZE) {
          setError("file" as never, {
            message: "File size must be under 10 MB",
          });
          return;
        }
        setValue("file" as never, file as never);
      }
    },
    [setError, setValue],
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      accept: ACCEPTED_TYPES,
      maxSize: MAX_FILE_SIZE,
      multiple: false,
    });

  const selectedFile = acceptedFiles[0] || undefined;
  const displayFile = fileWatch || selectedFile;

  const onSubmit = (data: UploadFormValues) => {
    if (!displayFile) {
      setError("file" as never, { message: "Please select a file" });
      return;
    }
    uploadMutation.mutate(
      {
        file: displayFile,
        category: data.category,
        description: data.description,
      },
      {
        onSuccess: () => {
          reset();
          onSuccess?.();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-sm text-muted-foreground">Drop the file here...</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Drag &amp; drop a file here, or click to select
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          PDF, Image, or Word documents (max 10 MB)
        </p>
      </div>

      {displayFile && (
        <div className="flex items-center gap-2 text-sm bg-muted/50 rounded p-2">
          <span className="truncate flex-1">{displayFile.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatFileSize(displayFile.size)}
          </span>
          <button
            type="button"
            onClick={() => {
              setValue("file" as never, undefined as never);
            }}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Remove file"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div>
        <Label htmlFor="doc-category">Category</Label>
        <select
          id="doc-category"
          {...register("category")}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="CONTRACT">Contract</option>
          <option value="NID">NID</option>
          <option value="CERTIFICATE">Certificate</option>
          <option value="PAYSLIP">Payslip</option>
          <option value="OTHER">Other</option>
        </select>
        {errors.category && (
          <p className="text-xs text-destructive mt-1">
            {errors.category.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="doc-desc">Description (optional)</Label>
        <textarea
          id="doc-desc"
          {...register("description")}
          rows={2}
          maxLength={255}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          placeholder="Add a brief description..."
        />
        {errors.description && (
          <p className="text-xs text-destructive mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {uploadMutation.uploadProgress > 0 &&
        uploadMutation.uploadProgress < 100 && (
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${uploadMutation.uploadProgress}%` }}
            />
          </div>
        )}

      <Button
        type="submit"
        disabled={uploadMutation.isPending || !displayFile}
        className="w-full"
      >
        {uploadMutation.isPending ? (
          <span className="flex items-center gap-2">
            <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Uploading...
          </span>
        ) : (
          "Upload Document"
        )}
      </Button>

      {uploadMutation.isError && (
        <p className="text-sm text-destructive text-center">
          {(uploadMutation.error as Error)?.message ??
            "Upload failed. Please try again."}
        </p>
      )}
    </form>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
