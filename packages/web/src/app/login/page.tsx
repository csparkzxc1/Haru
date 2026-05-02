"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("demo@haru.app");
  const [password, setPassword] = useState("demo1234!");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) router.replace("/today" as never);
  }, [user, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      router.replace("/today" as never);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-3xl font-semibold tracking-tight mb-2">하루</div>
      <p className="text-sm text-haru-muted mb-8">로그인하고 오늘을 시작하세요.</p>

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="text-xs text-haru-muted">이메일</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="mt-1 w-full rounded-xl border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 outline-none focus:border-haru-accent"
          />
        </label>
        <label className="block">
          <span className="text-xs text-haru-muted">비밀번호</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-xl border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 outline-none focus:border-haru-accent"
          />
        </label>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-haru-accent text-white py-3 font-medium hover:opacity-95 disabled:opacity-60"
        >
          {busy ? "로그인 중…" : "이메일로 로그인"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-haru-muted">
        <span className="flex-1 h-px bg-black/10 dark:bg-white/10" />또는
        <span className="flex-1 h-px bg-black/10 dark:bg-white/10" />
      </div>

      <a
        href={api.auth.kakaoUrl()}
        className="w-full inline-flex items-center justify-center rounded-xl bg-[#FEE500] text-[#191919] py-3 font-medium hover:opacity-95"
      >
        카카오로 시작하기
      </a>

      <p className="mt-8 text-xs text-haru-muted">
        아직 계정이 없으신가요?{" "}
        <Link href="/register" className="text-haru-accent hover:underline">
          회원가입
        </Link>
      </p>

      <p className="mt-2 text-[11px] text-haru-muted/70">
        로그인 시 <Link href="/terms" className="underline">이용약관</Link>과{" "}
        <Link href="/privacy" className="underline">개인정보처리방침</Link>에 동의한
        것으로 간주합니다.
      </p>
    </div>
  );
}
