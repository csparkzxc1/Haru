import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { parseKoreanEntry } from "@haru/shared/korean-date";
import type { ViewKind } from "./api";
import { localDb, type LocalTask } from "./db";
import { syncNow } from "./sync";
import { syncLocalNotifications } from "./notifications";

function scheduleNotifications() {
  void syncLocalNotifications();
}

const TASKS_KEY = (view: ViewKind) => ["local-tasks", view] as const;

export function useTasks(view: ViewKind) {
  return useQuery<LocalTask[]>({
    queryKey: TASKS_KEY(view),
    queryFn: async () => {
      // 백그라운드 동기화 트리거 — 결과는 await 하지 않음.
      void syncNow().then(scheduleNotifications);
      return localDb.listByView(view);
    },
    staleTime: 5_000,
  });
}

function invalidateTasks(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["local-tasks"] });
}

export function useQuickCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (raw: string) => {
      const parsed = parseKoreanEntry(raw);
      const id = uuidv4();
      const now = new Date().toISOString();
      await localDb.insertLocal({
        id,
        title: parsed.title,
        notes: null,
        status: "OPEN",
        when: parsed.when,
        deadline: parsed.deadline,
        allDay: parsed.allDay,
        projectId: null,
        areaId: null,
        sortOrder: 0,
        completedAt: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        version: 1,
        tags: parsed.tags,
      });
      await localDb.enqueueOutbox(id, "create", {
        title: parsed.title,
        when: parsed.when,
        deadline: parsed.deadline,
        allDay: parsed.allDay,
        tags: parsed.tags,
      });
      void syncNow().then(scheduleNotifications);
    },
    onSuccess: () => invalidateTasks(qc),
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const now = new Date().toISOString();
      await localDb.patchLocal(id, { status: "COMPLETED", completedAt: now });
      await localDb.enqueueOutbox(id, "complete", {});
      void syncNow().then(scheduleNotifications);
    },
    onSuccess: () => invalidateTasks(qc),
  });
}

export function useUncompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await localDb.patchLocal(id, { status: "OPEN", completedAt: null });
      await localDb.enqueueOutbox(id, "uncomplete", {});
      void syncNow().then(scheduleNotifications);
    },
    onSuccess: () => invalidateTasks(qc),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const now = new Date().toISOString();
      await localDb.patchLocal(id, { deletedAt: now });
      await localDb.enqueueOutbox(id, "delete", {});
      void syncNow().then(scheduleNotifications);
    },
    onSuccess: () => invalidateTasks(qc),
  });
}

/** RFC 4122 v4 UUID — react-native crypto polyfill 의존성을 피하기 위해 직접 구현. */
function uuidv4(): string {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
