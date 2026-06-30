import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listEsignRequests,
  getEsignRequest,
  createEsignRequest,
  signDocument,
  declineEsign,
} from "../api/esign.api";
import type { EsignStatus } from "../types/esign.types";

export function useEsignRequests(params?: {
  documentId?: string;
  status?: EsignStatus;
}) {
  return useQuery({
    queryKey: ["esign-requests", params],
    queryFn: () => listEsignRequests(params),
    staleTime: 30_000,
  });
}

export function useEsignRequest(requestId: string) {
  return useQuery({
    queryKey: ["esign-request", requestId],
    queryFn: () => getEsignRequest(requestId),
    refetchInterval: (query) =>
      query.state.data?.status === "PENDING" ? 30_000 : false,
  });
}

export function useCreateEsignRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEsignRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["esign-requests"] });
    },
  });
}

export function useSignDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      payload,
    }: {
      requestId: string;
      payload: { base64Signature: string };
    }) => signDocument(requestId, payload),
    onSuccess: (_data, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: ["esign-request", requestId] });
      queryClient.invalidateQueries({ queryKey: ["esign-requests"] });
    },
  });
}

export function useDeclineEsign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      payload,
    }: {
      requestId: string;
      payload: { reason?: string };
    }) => declineEsign(requestId, payload),
    onSuccess: (_data, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: ["esign-request", requestId] });
      queryClient.invalidateQueries({ queryKey: ["esign-requests"] });
    },
  });
}
