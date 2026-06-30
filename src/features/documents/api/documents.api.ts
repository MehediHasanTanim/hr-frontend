import { apiClient } from "@/lib/api-client";
import type {
  EmployeeDocument,
  SignedUrlResponse,
  DocumentCategory,
} from "../types/document.types";

export async function listDocuments(
  employeeId: string,
  category?: DocumentCategory,
): Promise<EmployeeDocument[]> {
  const response = await apiClient.get<EmployeeDocument[]>(
    `/api/v1/documents/employees/${employeeId}`,
    { params: category ? { category } : undefined },
  );
  return response.data;
}

export async function uploadDocument(
  employeeId: string,
  payload: { file: File; category: DocumentCategory; description?: string },
): Promise<EmployeeDocument> {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("category", payload.category);
  if (payload.description) {
    formData.append("description", payload.description);
  }

  const response = await apiClient.post<EmployeeDocument>(
    `/api/v1/documents/employees/${employeeId}/upload`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
}

export async function getSignedUrl(
  documentId: string,
): Promise<SignedUrlResponse> {
  const response = await apiClient.get<SignedUrlResponse>(
    `/api/v1/documents/${documentId}/signed-url`,
  );
  return response.data;
}

export async function deleteDocument(documentId: string): Promise<void> {
  await apiClient.delete(`/api/v1/documents/${documentId}`);
}
