import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import {
  listDocuments,
  uploadDocument,
  getSignedUrl,
  deleteDocument,
} from "../api/documents.api";
import type { DocumentCategory, UploadDocumentPayload } from "../types/document.types";

export function useDocuments(
  employeeId: string,
  category?: DocumentCategory,
) {
  return useQuery({
    queryKey: ["documents", employeeId, category ?? "all"],
    queryFn: () => listDocuments(employeeId, category),
    staleTime: 60_000,
  });
}

export function useUploadDocument(employeeId: string) {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (payload: UploadDocumentPayload) =>
      uploadDocument(employeeId, {
        file: payload.file,
        category: payload.category,
        description: payload.description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", employeeId] });
      setUploadProgress(0);
    },
    onError: () => {
      setUploadProgress(0);
    },
  });

  const mutateWithProgress = useCallback(
    (payload: UploadDocumentPayload) => {
      setUploadProgress(0);
      // The actual progress tracking would need an XHR wrapper.
      // For now, simulate progress via the mutation state.
      mutation.mutate(payload, {
        onSettled: () => setUploadProgress(100),
      });
    },
    [mutation],
  );

  return {
    ...mutation,
    mutate: mutateWithProgress,
    uploadProgress,
  };
}

export function useSignedUrl(documentId: string) {
  return useQuery({
    queryKey: ["signed-url", documentId],
    queryFn: () => getSignedUrl(documentId),
    staleTime: 600_000, // 10 min buffer before 15 min expiry
    enabled: !!documentId,
  });
}

export function useDeleteDocument(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", employeeId] });
    },
  });
}
