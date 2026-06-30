import { apiClient } from "@/lib/api-client";
import type {
  EsignRequest,
  CreateEsignRequestPayload,
  SignDocumentPayload,
  DeclineEsignPayload,
  EsignStatus,
} from "../types/esign.types";

export async function listEsignRequests(
  params?: { documentId?: string; status?: EsignStatus },
): Promise<EsignRequest[]> {
  const response = await apiClient.get<EsignRequest[]>(
    "/api/v1/esign/requests",
    { params },
  );
  return response.data;
}

export async function getEsignRequest(id: string): Promise<EsignRequest> {
  const response = await apiClient.get<EsignRequest>(
    `/api/v1/esign/requests/${id}`,
  );
  return response.data;
}

export async function createEsignRequest(
  payload: CreateEsignRequestPayload,
): Promise<EsignRequest> {
  const response = await apiClient.post<EsignRequest>(
    "/api/v1/esign/requests",
    payload,
  );
  return response.data;
}

export async function signDocument(
  requestId: string,
  payload: SignDocumentPayload,
): Promise<EsignRequest> {
  const response = await apiClient.post<EsignRequest>(
    `/api/v1/esign/requests/${requestId}/sign`,
    payload,
  );
  return response.data;
}

export async function declineEsign(
  requestId: string,
  payload: DeclineEsignPayload,
): Promise<EsignRequest> {
  const response = await apiClient.post<EsignRequest>(
    `/api/v1/esign/requests/${requestId}/decline`,
    payload,
  );
  return response.data;
}
