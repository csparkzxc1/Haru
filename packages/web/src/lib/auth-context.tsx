"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { api, tokenStore, type SafeUser } from "./api";

interface AuthState {
  user: SafeUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (body: {
    email: string;
    password: string;
    nickname: string;
    privacyAgreed: boolean;
    termsAgreed: boolean;
    marketingOptIn?: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | null>(null);

const PUBLIC_PATHS = new Set([
  "/login",
  "/register",
  "/privacy",
  "/terms",
  "/auth/callback",
]);

const PUBLIC_PREFIXES = ["/invite/"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const bootstrap = useCallback(async () => {
    const refresh = tokenStore.getRefresh();
    if (!refresh) {
      setLoading(false);
      return;
    }
    try {
      // /auth/me는 access 토큰이 필요. 401이면 자동 refresh 시도됨.
      const me = await api.auth.me();
      setUser(me);
    } catch {
      tokenStore.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // 로그인 안 됐고 보호 경로면 /login으로
  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic(pathname)) {
      router.replace("/login" as never);
    }
  }, [user, loading, pathname, router]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    setUser(res.user);
  }, []);

  const register = useCallback<AuthState["register"]>(async (body) => {
    const res = await api.auth.register(body);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout();
    setUser(null);
    router.replace("/login" as never);
  }, [router]);

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function isPublic(pathname: string | null): boolean {
  if (!pathname) return false;
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}
