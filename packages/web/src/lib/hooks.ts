"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ViewKind } from "./api";

const TASKS_KEY = (view: ViewKind) => ["tasks", view] as const;

export function useTasks(view: ViewKind) {
  return useQuery({
    queryKey: TASKS_KEY(view),
    queryFn: () => api.tasks.list(view),
  });
}

export function useAreas() {
  return useQuery({
    queryKey: ["areas"],
    queryFn: () => api.areas.list(),
  });
}

function invalidateAllTaskViews(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["tasks"] });
}

export function useQuickCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (raw: string) => api.quickEntry.create(raw),
    onSuccess: () => invalidateAllTaskViews(qc),
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.tasks.complete(id),
    onSuccess: () => invalidateAllTaskViews(qc),
  });
}

export function useUncompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.tasks.update(id, { status: "OPEN" }),
    onSuccess: () => invalidateAllTaskViews(qc),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.tasks.remove(id),
    onSuccess: () => invalidateAllTaskViews(qc),
  });
}
