import { apiClient } from "@/lib/api-client";
import type {
  Policy,
  PolicyAcknowledgement,
  AcknowledgementStats,
  CreatePolicyPayload,
} from "../types/policy.types";

export async function listPolicies(): Promise<Policy[]> {
  const response = await apiClient.get<Policy[]>("/api/v1/compliance/policies");
  return response.data;
}

export async function getPolicy(id: string): Promise<Policy> {
  const response = await apiClient.get<Policy>(
    `/api/v1/compliance/policies/${id}`,
  );
  return response.data;
}

export async function createPolicy(
  payload: CreatePolicyPayload,
): Promise<Policy> {
  const response = await apiClient.post<Policy>(
    "/api/v1/compliance/policies",
    payload,
  );
  return response.data;
}

export async function publishPolicy(id: string): Promise<Policy> {
  const response = await apiClient.post<Policy>(
    `/api/v1/compliance/policies/${id}/publish`,
  );
  return response.data;
}

export async function archivePolicy(id: string): Promise<Policy> {
  const response = await apiClient.post<Policy>(
    `/api/v1/compliance/policies/${id}/archive`,
  );
  return response.data;
}

export async function acknowledgePolicy(
  id: string,
): Promise<PolicyAcknowledgement> {
  const response = await apiClient.post<PolicyAcknowledgement>(
    `/api/v1/compliance/policies/${id}/acknowledge`,
  );
  return response.data;
}

export async function getAcknowledgementStats(
  id: string,
): Promise<AcknowledgementStats> {
  const response = await apiClient.get<PolicyAcknowledgement[]>(
    `/api/v1/compliance/policies/${id}/acknowledgements`,
  );
  const acknowledgements = response.data;
  return {
    acknowledgedCount: acknowledgements.length,
    pendingCount: 0,
    totalEmployees: 0,
  };
}
