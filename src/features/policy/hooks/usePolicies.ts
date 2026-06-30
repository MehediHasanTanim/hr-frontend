import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listPolicies,
  acknowledgePolicy,
  publishPolicy,
  archivePolicy,
} from "../api/policy.api";

export function usePolicies() {
  return useQuery({
    queryKey: ["policies"],
    queryFn: listPolicies,
    staleTime: 30_000,
  });
}

export function useAcknowledgePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (policyId: string) => acknowledgePolicy(policyId),
    onSuccess: (_data, policyId) => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      queryClient.invalidateQueries({ queryKey: ["policy", policyId] });
    },
  });
}

export function usePublishPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (policyId: string) => publishPolicy(policyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
  });
}

export function useArchivePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (policyId: string) => archivePolicy(policyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
  });
}
