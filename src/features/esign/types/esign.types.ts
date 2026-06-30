export type EsignStatus = 'PENDING' | 'SIGNED' | 'DECLINED' | 'EXPIRED';

export interface EsignRequest {
  id: string;
  documentId: string;
  requestedBy: string;
  signerEmployeeId: string;
  status: EsignStatus;
  documentSha256AtSign: string | null;
  declineReason: string | null;
  expiresAt: string;
  signedAt: string | null;
  declinedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEsignRequestPayload {
  documentId: string;
  signerEmployeeId: string;
}

export interface SignDocumentPayload {
  base64Signature: string;
}

export interface DeclineEsignPayload {
  reason?: string;
}
