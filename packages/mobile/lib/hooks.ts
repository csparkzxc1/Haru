import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api, type ViewKind } from "./api";

export function useTasks(view: ViewKind) {
  return useQuery({
    queryKey: ["tasks", view],
    queryFn: () => api.tasks.list(view),
  });
}

function invalidateTasks(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["tasks"] });
}

export function useQuickCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (raw: string) => api.quickEntry.create(raw),
    onSuccess: () => invalidateTasks(qc),
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.tasks.complete(id),
    onSuccess: () => invalidateTasks(qc),
  });
}

export function useUncompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.tasks.update(id, { status: "OPEN" }),
    onSuccess: () => invalidateTasks(qc),
  });
}
