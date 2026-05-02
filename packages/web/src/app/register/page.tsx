"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agree) {
      setError("이용약관과 개인정보처리방침에 동의해 주세요");
      return;
    }
    setBusy(true);
    try {
      await register({
        email,
        password,
        nickname,
        privacyAgreed: true,
        termsAgreed: true,
        marketingOptIn: marketing,
      });
      router.replace("/today" as never);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-3xl font-semibold tracking-tight mb-2">회원가입</div>
      <p className="text-sm text-haru-muted mb-8">하루를 시작할 준비가 되셨나요?</p>

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
          <span className="text-xs text-haru-muted">닉네임</span>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            autoComplete="nickname"
            className="mt-1 w-full rounded-xl border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 outline-none focus:border-haru-accent"
          />
        </label>
        <label className="block">
          <span className="text-xs text-haru-muted">비밀번호 (8자 이상)</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            autoComplete="new-password"
            className="mt-1 w-full rounded-xl border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 outline-none focus:border-haru-accent"
          />
        </label>

        <div className="pt-2 space-y-2 text-sm">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1"
            />
            <span>
              <Link href="/terms" className="underline">이용약관</Link>과{" "}
              <Link href="/privacy" className="underline">개인정보처리방침</Link>에
              동의합니다 (필수)
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              className="mt-1"
            />
            <span className="text-haru-muted">
              마케팅 정보 수신 (선택)
            </span>
          </label>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-haru-accent text-white py-3 font-medium hover:opacity-95 disabled:opacity-60"
        >
          {busy ? "가입 중…" : "가입하기"}
        </button>
      </form>

      <p className="mt-8 text-xs text-haru-muted">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-haru-accent hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
