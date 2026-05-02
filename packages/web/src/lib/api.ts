/**
 * 하루 백엔드 REST 클라이언트.
 *
 * 인증: Bearer JWT.
 *   - 액세스 토큰은 메모리에만 보관(XSS 노출 최소화)
 *   - 리프레시 토큰은 localStorage('haru.refresh') 에 보관
 *   - 401 발생 시 자동으로 /auth/refresh 호출 후 한 번 재시도
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

export type FamilyEventKind =
  | "WEDDING"
  | "FUNERAL"
  | "BIRTHDAY"
  | "ANNIVERSARY"
  | "BABY_100D"
  | "BABY_DOL"
  | "HOUSEWARMING"
  | "PROMOTION"
  | "OTHER";

export interface ApiFamilyEvent {
  id: string;
  ownerId: string;
  kind: FamilyEventKind;
  personLabel: string;
  relation: string | null;
  date: string;
  venue: string | null;
  amountKrw: number | null;
  receivedKrw: number | null;
  notes: string | null;
  attended: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFamilyEventBody {
  kind: FamilyEventKind;
  personLabel: string;
  relation?: string;
  date: string;
  venue?: string;
  amountKrw?: number;
  receivedKrw?: number;
  notes?: string;
  attended?: boolean;
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

export interface SafeUser {
  id: string;
  email: string | null;
  nickname: string;
  timezone: string;
  locale: string;
  avatarUrl: string | null;
  plan: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: SafeUser;
  tokens: AuthTokens;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api";

const REFRESH_KEY = "haru.refresh";

export class ApiError extends Error {
  constructor(public status: number, message: string, public payload?: unknown) {
    super(message);
  }
}

class TokenStore {
  private accessToken: string | null = null;
  private listeners = new Set<(tok: string | null) => void>();

  setAccess(token: string | null) {
    this.accessToken = token;
    for (const l of this.listeners) l(token);
  }

  getAccess(): string | null {
    return this.accessToken;
  }

  subscribe(fn: (tok: string | null) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  setRefresh(token: string | null) {
    if (typeof window === "undefined") return;
    if (token) window.localStorage.setItem(REFRESH_KEY, token);
    else window.localStorage.removeItem(REFRESH_KEY);
  }

  getRefresh(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_KEY);
  }

  clear() {
    this.setAccess(null);
    this.setRefresh(null);
  }
}

export const tokenStore = new TokenStore();

let refreshPromise: Promise<AuthTokens> | null = null;

async function tryRefresh(): Promise<AuthTokens | null> {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return null;
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    }).then(async (res) => {
      if (!res.ok) {
        tokenStore.clear();
        throw new ApiError(res.status, "세션이 만료되었습니다");
      }
      return (await res.json()) as AuthTokens;
    });
  }
  try {
    const tokens = await refreshPromise;
    tokenStore.setAccess(tokens.accessToken);
    tokenStore.setRefresh(tokens.refreshToken);
    return tokens;
  } finally {
    refreshPromise = null;
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  retryOn401 = true,
): Promise<T> {
  const access = tokenStore.getAccess();
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  if (access) headers.set("authorization", `Bearer ${access}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (res.status === 401 && retryOn401) {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(path, init, false);
  }

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
  auth: {
    async register(body: {
      email: string;
      password: string;
      nickname: string;
      privacyAgreed: boolean;
      termsAgreed: boolean;
      marketingOptIn?: boolean;
    }): Promise<AuthResult> {
      const result = await request<AuthResult>("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      });
      tokenStore.setAccess(result.tokens.accessToken);
      tokenStore.setRefresh(result.tokens.refreshToken);
      return result;
    },
    async login(email: string, password: string): Promise<AuthResult> {
      const result = await request<AuthResult>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      tokenStore.setAccess(result.tokens.accessToken);
      tokenStore.setRefresh(result.tokens.refreshToken);
      return result;
    },
    async logout(): Promise<void> {
      const refreshToken = tokenStore.getRefresh();
      if (refreshToken) {
        await request("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        }).catch(() => undefined);
      }
      tokenStore.clear();
    },
    me() {
      return request<SafeUser>("/auth/me");
    },
    /** 카카오 로그인 시작. 백엔드가 카카오 인가 페이지로 리디렉트한다. */
    kakaoUrl(): string {
      return `${API_BASE}/auth/kakao`;
    },
  },
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
    create(body: { title: string; colorHex?: string; icon?: string }) {
      return request<ApiArea>("/areas", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    invite(areaId: string) {
      return request<{ token: string; expiresAt: string; areaTitle: string }>(
        `/areas/${areaId}/invites`,
        { method: "POST" },
      );
    },
    accept(token: string) {
      return request<{ areaId: string; userId: string; role: string }>(
        "/areas/invites/accept",
        { method: "POST", body: JSON.stringify({ token }) },
      );
    },
    members(areaId: string) {
      return request<
        {
          id: string;
          role: string;
          user: { id: string; nickname: string; email: string | null };
        }[]
      >(`/areas/${areaId}/members`);
    },
  },
  familyEvents: {
    list(year?: number) {
      const qs = year ? `?year=${year}` : "";
      return request<ApiFamilyEvent[]>(`/family-events${qs}`);
    },
    stats(year: number) {
      return request<{
        year: number;
        sent: number;
        received: number;
        net: number;
        byKind: Record<string, number>;
        count: number;
      }>(`/family-events/stats/${year}`);
    },
    create(body: CreateFamilyEventBody) {
      return request<ApiFamilyEvent>("/family-events", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    update(id: string, body: Partial<CreateFamilyEventBody>) {
      return request<ApiFamilyEvent>(`/family-events/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    },
    remove(id: string) {
      return request<{ ok: true }>(`/family-events/${id}`, { method: "DELETE" });
    },
  },
  calendar: {
    subscribeToken() {
      return request<{ ics: string; webcal: string }>("/calendar/subscribe-token");
    },
  },
  data: {
    /** 브라우저에서 즉시 다운로드. token을 query 로 넘기는 대신 fetch + Blob. */
    async exportAll(): Promise<Blob> {
      const access = tokenStore.getAccess();
      const res = await fetch(`${API_BASE}/data/export`, {
        headers: access ? { authorization: `Bearer ${access}` } : {},
      });
      if (!res.ok) {
        if (res.status === 401) {
          await tryRefresh();
          return api.data.exportAll();
        }
        throw new ApiError(res.status, "데이터 내보내기 실패");
      }
      return res.blob();
    },
    deleteAccount() {
      return request<{ ok: true; scheduledFor: string }>("/data/account", {
        method: "DELETE",
      });
    },
  },
  widgets: {
    today() {
      return request<{
        date: string;
        holiday: string | null;
        total: number;
        done: number;
        progress: number;
        preview: { id: string; title: string; when: string | null; status: string }[];
      }>("/widgets/today");
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
