import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api, type SafeUser } from "./api";

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

export function AuthProvider({
  children,
  onLogout,
}: {
  children: React.ReactNode;
  onLogout?: () => Promise<void> | void;
}) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    try {
      if (!(await api.auth.hasRefresh())) return;
      const me = await api.auth.me();
      setUser(me);
    } catch {
      // 무시 — 로그인 화면으로 떨어짐
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api.auth.login(email, password);
    setUser(r.user);
  }, []);

  const register = useCallback<AuthState["register"]>(async (body) => {
    const r = await api.auth.register(body);
    setUser(r.user);
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout();
    if (onLogout) await onLogout();
    setUser(null);
  }, [onLogout]);

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
