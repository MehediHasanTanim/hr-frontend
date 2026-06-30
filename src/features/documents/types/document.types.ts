export type DocumentCategory =
  | 'CONTRACT'
  | 'NID'
  | 'CERTIFICATE'
  | 'PAYSLIP'
  | 'OTHER';

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  category: DocumentCategory;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  version: number;
  sha256Hash: string;
  description: string | null;
  uploadedBy: string | null;
  createdAt: string; // ISO 8601
}

export interface SignedUrlResponse {
  signedUrl: string;
  expiresInSeconds: number;
}

export interface UploadDocumentPayload {
  file: File;
  category: DocumentCategory;
  description?: string;
}
