/**
 * 하루 모바일 백엔드 클라이언트.
 *
 * - 토큰: AsyncStorage 보관 (액세스/리프레시 모두). RN 환경에서는 메모리 분리의
 *   이점이 적고 앱 종료 시 세션 유지가 더 중요.
 * - 만료(401) 발생 시 자동으로 /auth/refresh 호출 후 한 번 재시도.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
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

export interface ApiTaskTag {
  taskId: string;
  tagId: string;
  tag: { id: string; name: string };
}

export interface ApiTask {
  id: string;
  title: string;
  notes: string | null;
  status: TaskStatus;
  when: string | null;
  deadline: string | null;
  allDay: boolean;
  projectId: string | null;
  areaId: string | null;
  createdAt: string;
  taskTags: ApiTaskTag[];
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

const ACCESS_KEY = "haru.access";
const REFRESH_KEY = "haru.refresh";

function resolveApiBase(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE;
  if (fromEnv) return fromEnv;
  // Expo Go 등에서 호스트 머신 IP를 자동 추정
  const host =
    Constants.expoConfig?.hostUri?.split(":")[0] ??
    Constants.manifest2?.extra?.expoGo?.developer?.host?.split(":")[0];
  if (host) return `http://${host}:3001/api`;
  return "http://localhost:3001/api";
}

const API_BASE = resolveApiBase();

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

let accessTokenCache: string | null = null;
let refreshPromise: Promise<AuthTokens> | null = null;

async function getAccess(): Promise<string | null> {
  if (accessTokenCache) return accessTokenCache;
  const stored = await AsyncStorage.getItem(ACCESS_KEY);
  accessTokenCache = stored;
  return stored;
}

async function setTokens(tokens: AuthTokens | null) {
  if (tokens) {
    accessTokenCache = tokens.accessToken;
    await AsyncStorage.multiSet([
      [ACCESS_KEY, tokens.accessToken],
      [REFRESH_KEY, tokens.refreshToken],
    ]);
  } else {
    accessTokenCache = null;
    await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
  }
}

async function tryRefresh(): Promise<AuthTokens | null> {
  const refreshToken = await AsyncStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return null;
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).then(async (res) => {
      if (!res.ok) {
        await setTokens(null);
        throw new ApiError(res.status, "세션이 만료되었습니다");
      }
      return (await res.json()) as AuthTokens;
    });
  }
  try {
    const tokens = await refreshPromise;
    await setTokens(tokens);
    return tokens;
  } finally {
    refreshPromise = null;
  }
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
  retryOn401 = true,
): Promise<T> {
  const access = await getAccess();
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (access) headers.authorization = `Bearer ${access}`;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (res.status === 401 && retryOn401) {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(path, init, false);
  }

  if (!res.ok) {
    let msg = `Request failed: ${res.status}`;
    try {
      const data = (await res.json()) as { message?: string };
      if (data?.message) msg = data.message;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, msg);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  baseUrl: API_BASE,
  auth: {
    async login(email: string, password: string): Promise<AuthResult> {
      const result = await request<AuthResult>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await setTokens(result.tokens);
      return result;
    },
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
      await setTokens(result.tokens);
      return result;
    },
    async logout(): Promise<void> {
      const refreshToken = await AsyncStorage.getItem(REFRESH_KEY);
      if (refreshToken) {
        await request("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        }).catch(() => undefined);
      }
      await setTokens(null);
    },
    me() {
      return request<SafeUser>("/auth/me");
    },
    async hasRefresh(): Promise<boolean> {
      return !!(await AsyncStorage.getItem(REFRESH_KEY));
    },
  },
  tasks: {
    list(view: ViewKind) {
      return request<ApiTask[]>(`/tasks?view=${view}`);
    },
    complete(id: string) {
      return request<ApiTask>(`/tasks/${id}/complete`, { method: "POST" });
    },
    update(id: string, body: { status?: TaskStatus }) {
      return request<ApiTask>(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    },
    remove(id: string) {
      return request<{ ok: true }>(`/tasks/${id}`, { method: "DELETE" });
    },
  },
  areas: {
    list() {
      return request<
        { id: string; title: string; colorHex: string; shared: boolean }[]
      >("/areas");
    },
    invite(areaId: string) {
      return request<{ token: string; expiresAt: string; areaTitle: string }>(
        `/areas/${areaId}/invites`,
        { method: "POST" },
      );
    },
    accept(token: string) {
      return request("/areas/invites/accept", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
    },
  },
  quickEntry: {
    create(raw: string) {
      return request<ApiTask>("/quick-entry", {
        method: "POST",
        body: JSON.stringify({ raw }),
      });
    },
  },
};
