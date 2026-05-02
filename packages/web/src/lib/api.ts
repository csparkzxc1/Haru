/**
 * 하루 백엔드 REST 클라이언트.
 *
 * v1: 인증 미도입 — `x-user-id` 헤더로 로컬 데모 사용자 식별.
 *     Phase 1 후반부 JWT/카카오 OAuth 도입 시 토큰 헤더로 교체.
 */

import type { ParsedEntry } from "@haru/shared/korean-date";

export type ViewKind =
  | "inbox"
  | "today"
  | "thisWeek"
  | "upcoming"
  | "anytime"
  | "someday"
  | "logbook";

export type TaskStatus = "OPEN" | "COMPLETED" | "CANCELED";

export interface ApiTag {
  id: string;
  name: string;
  colorHex: string | null;
}

export interface ApiTaskTag {
  taskId: string;
  tagId: string;
  tag: ApiTag;
}

export interface ApiChecklistItem {
  id: string;
  taskId: string;
  title: string;
  done: boolean;
  sortOrder: number;
}

export interface ApiTask {
  id: string;
  ownerId: string;
  projectId: string | null;
  areaId: string | null;
  title: string;
  notes: string | null;
  status: TaskStatus;
  when: string | null;
  deadline: string | null;
  allDay: boolean;
  recurrenceJson: unknown;
  sortOrder: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  checklistItems: ApiChecklistItem[];
  taskTags: ApiTaskTag[];
}

export interface ApiArea {
  id: string;
  ownerId: string;
  title: string;
  colorHex: string;
  icon: string | null;
  shared: boolean;
  sortOrder: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { projects: number; tasks: number };
}

export interface CreateTaskBody {
  title: string;
  notes?: string;
  projectId?: string;
  areaId?: string;
  when?: string;
  deadline?: string;
  allDay?: boolean;
  tags?: string[];
  checklist?: string[];
}

export interface UpdateTaskBody {
  title?: string;
  notes?: string;
  when?: string | null;
  deadline?: string | null;
  allDay?: boolean;
  status?: TaskStatus;
  tags?: string[];
  projectId?: string;
  areaId?: string;
  sortOrder?: number;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

function userId(): string {
  if (typeof window === "undefined") return DEMO_USER_ID;
  const stored = window.localStorage.getItem("haru.userId");
  if (stored) return stored;
  window.localStorage.setItem("haru.userId", DEMO_USER_ID);
  return DEMO_USER_ID;
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public payload?: unknown) {
    super(message);
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-user-id": userId(),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let payload: unknown;
    try {
      payload = await res.json();
    } catch {
      payload = await res.text();
    }
    const msg =
      typeof payload === "object" && payload !== null && "message" in payload
        ? String((payload as { message: unknown }).message)
        : `Request failed: ${res.status}`;
    throw new ApiError(res.status, msg, payload);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  tasks: {
    list(view: ViewKind, params: { areaId?: string; projectId?: string } = {}) {
      const qs = new URLSearchParams({ view });
      if (params.areaId) qs.set("areaId", params.areaId);
      if (params.projectId) qs.set("projectId", params.projectId);
      return request<ApiTask[]>(`/tasks?${qs.toString()}`);
    },
    create(body: CreateTaskBody) {
      return request<ApiTask>("/tasks", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    update(id: string, body: UpdateTaskBody) {
      return request<ApiTask>(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    },
    complete(id: string) {
      return request<ApiTask>(`/tasks/${id}/complete`, { method: "POST" });
    },
    remove(id: string) {
      return request<{ ok: true }>(`/tasks/${id}`, { method: "DELETE" });
    },
  },
  areas: {
    list() {
      return request<ApiArea[]>("/areas");
    },
  },
  quickEntry: {
    preview(raw: string) {
      return request<ParsedEntry>("/quick-entry/preview", {
        method: "POST",
        body: JSON.stringify({ raw }),
      });
    },
    create(raw: string, opts: { projectId?: string; areaId?: string } = {}) {
      return request<ApiTask>("/quick-entry", {
        method: "POST",
        body: JSON.stringify({ raw, ...opts }),
      });
    },
  },
};
