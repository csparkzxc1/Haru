"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokenStore } from "@/lib/api";

/**
 * 카카오 OAuth 콜백 핸들러.
 * 백엔드는 access/refresh 토큰을 URL fragment(#)로 전달한다.
 * fragment는 서버로 전송되지 않으므로 토큰이 서버 로그에 남지 않는다.
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const fragment = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(fragment);
    const access = params.get("access");
    const refresh = params.get("refresh");

    if (access && refresh) {
      tokenStore.setAccess(access);
      tokenStore.setRefresh(refresh);
      // 해시 제거 후 홈으로
      window.history.replaceState({}, "", "/today");
      router.replace("/today" as never);
    } else {
      router.replace("/login" as never);
    }
  }, [router]);

  return <div className="text-haru-muted text-sm">로그인 처리 중…</div>;
}
