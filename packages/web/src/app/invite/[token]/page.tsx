"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function InviteAcceptPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [state, setState] = useState<"idle" | "accepting" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const token = params?.token;

  useEffect(() => {
    if (loading || !token) return;
    if (!user) {
      // 로그인 필요. 로그인 후 돌아오기 위해 url 에 token 보존
      router.replace(
        `/login?redirect=${encodeURIComponent(`/invite/${token}`)}` as never,
      );
      return;
    }
    if (state !== "idle") return;
    setState("accepting");
    api.areas
      .accept(token)
      .then(() => {
        setState("ok");
        setTimeout(() => router.replace("/today" as never), 1200);
      })
      .catch((err: Error) => {
        setState("error");
        setMessage(err.message);
      });
  }, [loading, user, token, state, router]);

  if (loading || state === "accepting" || state === "idle") {
    return <div className="text-sm text-haru-muted">초대 처리 중…</div>;
  }
  if (state === "ok") {
    return (
      <div className="text-center">
        <div className="text-xl font-semibold mb-2">합류 완료</div>
        <div className="text-sm text-haru-muted">잠시 후 오늘 화면으로 이동합니다.</div>
      </div>
    );
  }
  return (
    <div className="text-center max-w-sm">
      <div className="text-xl font-semibold mb-2">초대 실패</div>
      <div className="text-sm text-haru-muted">{message}</div>
    </div>
  );
}
