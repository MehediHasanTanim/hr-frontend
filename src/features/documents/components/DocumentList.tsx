"use client";

import { FileText, Image, File, Download, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBytes, mimeTypeToIcon, truncate } from "@/lib/utils";
import { useDocuments, useSignedUrl, useDeleteDocument } from "../hooks/useDocuments";
import { DocumentCategoryBadge } from "./DocumentCategoryBadge";
import type { DocumentCategory } from "../types/document.types";

interface DocumentListProps {
  employeeId: string;
  category?: DocumentCategory;
  userRole?: string;
}

function DocumentIcon({ mimeType }: { mimeType: string }) {
  const iconType = mimeTypeToIcon(mimeType);
  switch (iconType) {
    case "FileText":
      return <FileText className="size-4 text-blue-500" />;
    case "Image":
      return <Image className="size-4 text-green-500" />;
    default:
      return <File className="size-4 text-gray-500" />;
  }
}

function DownloadButton({ documentId }: { documentId: string }) {
  const { refetch, isFetching } = useSignedUrl(documentId);

  const handleDownload = async () => {
    const result = await refetch();
    if (result.data?.signedUrl) {
      window.open(result.data.signedUrl, "_blank");
    }
  };

  return (
    <Button
      size="xs"
      variant="ghost"
      onClick={handleDownload}
      disabled={isFetching}
      aria-label="Download document"
    >
      <Download className="size-3.5 mr-1" />
      {isFetching ? "Loading..." : "Download"}
    </Button>
  );
}

function DeleteButton({
  documentId,
  employeeId,
}: {
  documentId: string;
  employeeId: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const deleteMutation = useDeleteDocument(employeeId);

  if (confirming) {
    return (
      <span className="flex items-center gap-1 text-xs">
        Delete this document?
        <Button
          size="xs"
          variant="destructive"
          onClick={() => {
            deleteMutation.mutate(documentId);
            setConfirming(false);
          }}
          disabled={deleteMutation.isPending}
        >
          Confirm
        </Button>
        <Button size="xs" variant="ghost" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </span>
    );
  }

  return (
    <Button
      size="xs"
      variant="ghost"
      onClick={() => setConfirming(true)}
      aria-label="Delete document"
    >
      <Trash2 className="size-3.5 text-red-500" />
    </Button>
  );
}

export function DocumentList({
  employeeId,
  category,
  userRole,
}: DocumentListProps) {
  const { data: documents, isLoading } = useDocuments(employeeId, category);
  const isHrAdmin = userRole === "HR_ADMIN";

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <Skeleton className="size-8 rounded" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <File className="size-12 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No documents found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="pb-2 pl-4 font-medium">Type</th>
            <th className="pb-2 font-medium">Name</th>
            <th className="pb-2 font-medium">Category</th>
            <th className="pb-2 font-medium">Version</th>
            <th className="pb-2 font-medium">Size</th>
            <th className="pb-2 font-medium">Uploaded</th>
            <th className="pb-2 pr-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id} className="border-b last:border-b-0 hover:bg-muted/50">
              <td className="py-3 pl-4">
                <DocumentIcon mimeType={doc.mimeType} />
              </td>
              <td className="py-3">
                <span title={doc.originalName}>
                  {truncate(doc.originalName, 40)}
                </span>
              </td>
              <td className="py-3">
                <DocumentCategoryBadge category={doc.category} />
              </td>
              <td className="py-3 text-muted-foreground">v{doc.version}</td>
              <td className="py-3 text-muted-foreground">
                {formatBytes(doc.sizeBytes)}
              </td>
              <td className="py-3 text-muted-foreground">
                {formatDistanceToNow(new Date(doc.createdAt), {
                  addSuffix: true,
                })}
              </td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-1">
                  <DownloadButton documentId={doc.id} />
                  {isHrAdmin && (
                    <DeleteButton
                      documentId={doc.id}
                      employeeId={employeeId}
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
