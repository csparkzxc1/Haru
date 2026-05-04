"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function AreasPage() {
  const qc = useQueryClient();
  const { data: areas, isLoading } = useQuery({
    queryKey: ["areas"],
    queryFn: () => api.areas.list(),
  });

  const [title, setTitle] = useState("");
  const create = useMutation({
    mutationFn: () => api.areas.create({ title: title.trim() }),
    onSuccess: () => {
      setTitle("");
      qc.invalidateQueries({ queryKey: ["areas"] });
    },
  });

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">영역</h1>
        <p className="text-sm text-haru-muted mt-1">
          가족·팀과 공유하거나 개인 분류로 사용
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim()) create.mutate();
        }}
        className="mb-8 flex gap-2"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="새 영역 이름 (예: 가족, 회사)"
          className="flex-1 rounded-xl border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 outline-none focus:border-haru-accent"
        />
        <button
          type="submit"
          disabled={!title.trim() || create.isPending}
          className="px-4 rounded-xl bg-haru-accent text-white text-sm font-medium disabled:opacity-50"
        >
          추가
        </button>
      </form>

      {isLoading ? (
        <div className="text-haru-muted text-sm">불러오는 중…</div>
      ) : (
        <ul className="divide-y divide-black/5 dark:divide-white/10">
          {(areas ?? []).map((a) => (
            <AreaRow key={a.id} area={a} />
          ))}
        </ul>
      )}
    </>
  );
}

function AreaRow({
  area,
}: {
  area: {
    id: string;
    title: string;
    colorHex: string;
    icon: string | null;
    shared: boolean;
    _count?: { members: number; tasks: number };
  };
}) {
  const [token, setToken] = useState<{ token: string; expiresAt: string } | null>(
    null,
  );
  const invite = useMutation({
    mutationFn: () => api.areas.invite(area.id),
    onSuccess: (r) => setToken({ token: r.token, expiresAt: r.expiresAt }),
  });

  const inviteUrl =
    typeof window !== "undefined" && token
      ? `${window.location.origin}/invite/${token.token}`
      : "";

  return (
    <li className="py-4">
      <div className="flex items-center gap-3">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: area.colorHex }}
        />
        <div className="flex-1">
          <div className="font-medium">
            {area.icon} {area.title}
            {area.shared && (
              <span className="ml-2 text-xs text-haru-muted">· 공유</span>
            )}
          </div>
          <div className="text-xs text-haru-muted mt-0.5">
            할 일 {area._count?.tasks ?? 0}개
            {area._count?.members ? ` · 멤버 ${area._count.members}명` : ""}
          </div>
        </div>
        <button
          onClick={() => invite.mutate()}
          disabled={invite.isPending}
          className="text-xs px-3 py-1.5 rounded-md border border-black/10 dark:border-white/15 hover:border-haru-accent"
        >
          초대
        </button>
      </div>
      {token && (
        <div className="mt-3 ml-6 p-3 rounded-lg bg-black/[.02] dark:bg-white/[.03] text-xs">
          <div className="text-haru-muted mb-1">
            초대 링크 (
            {new Date(token.expiresAt).toLocaleDateString("ko-KR")} 까지)
          </div>
          <code className="break-all">{inviteUrl}</code>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => navigator.clipboard?.writeText(inviteUrl)}
              className="text-haru-accent hover:underline"
            >
              복사
            </button>
            <button
              onClick={() => shareViaKakao(inviteUrl, area.title)}
              className="text-haru-accent hover:underline"
            >
              카카오톡으로 공유
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

async function shareViaKakao(url: string, areaTitle: string) {
  const text = `[하루] '${areaTitle}' 영역 초대\n${url}`;
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: "하루 초대", text, url });
      return;
    } catch {
      // 사용자가 취소
    }
  }
  // 폴백: 카카오톡 모바일 웹 sharer URL
  if (typeof window !== "undefined") {
    const kakao = `https://accounts.kakao.com/weblogin/kakaotalk_share?url=${encodeURIComponent(url)}`;
    window.open(kakao, "_blank");
  }
}
