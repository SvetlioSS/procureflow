import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PurchaseRequest, Assessment } from "@/types";

export function usePRs() {
  return useQuery({
    queryKey: ["prs"],
    queryFn: async (): Promise<PurchaseRequest[]> => {
      const { data } = await api.get("/pr");
      return data.map((x: PurchaseRequest) => ({
        ...x,
        createdAt: new Date(x.createdAt).toISOString(),
        updatedAt: new Date(x.updatedAt).toISOString(),
      }));
    },
  });
}

export function usePR(id: string) {
  return useQuery({
    queryKey: ["pr", id],
    queryFn: async (): Promise<PurchaseRequest> => {
      const { data } = await api.get(`/pr/${id}`);
      return {
        ...data,
        createdAt: new Date(data.createdAt).toISOString(),
        updatedAt: new Date(data.updatedAt).toISOString(),
        items: JSON.parse(data.items),
      };
    },
    enabled: !!id,
  });
}

export function useLatestAssessment(id: string) {
  return useQuery({
    queryKey: ["assessment:last", id],
    queryFn: async (): Promise<Assessment | { error: string }> => {
      const { data } = await api.get(`/pr/${id}/assessment/last`);
      return data;
    },
    enabled: !!id,
  });
}

export function useAssessMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/agent/assess/${id}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assessment:last", id] });
      qc.invalidateQueries({ queryKey: ["pr", id] });
      qc.invalidateQueries({ queryKey: ["prs"] });
    },
  });
}

export function useApproveMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.post(`/pr/${id}/approve`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pr", id] });
      qc.invalidateQueries({ queryKey: ["prs"] });
    },
  });
}

export function useRejectMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reason: string) =>
      (await api.post(`/pr/${id}/reject`, { reason })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pr", id] });
      qc.invalidateQueries({ queryKey: ["assessment:last", id] });
      qc.invalidateQueries({ queryKey: ["prs"] });
    },
  });
}
