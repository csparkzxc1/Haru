"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useTheme, type ColorScheme, type FontScale } from "@/lib/theme";

export default function SettingsPage() {
  const { user } = useAuth();
  const { scheme, setScheme, fontScale, setFontScale } = useTheme();
  const [calLink, setCalLink] = useState<{ ics: string; webcal: string } | null>(
    null,
  );
  const [calLoading, setCalLoading] = useState(false);

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">설정</h1>
      </header>

      <Section title="계정">
        <div className="text-sm">
          <div className="text-haru-muted">로그인됨</div>
          <div className="mt-1">{user?.nickname}</div>
          {user?.email && (
            <div className="text-xs text-haru-muted mt-0.5">{user.email}</div>
          )}
        </div>
      </Section>

      <Section title="화면">
        <Group label="색 모드">
          {(["system", "light", "dark"] as ColorScheme[]).map((s) => (
            <Choice
              key={s}
              active={scheme === s}
              onClick={() => setScheme(s)}
              label={
                s === "system" ? "시스템" : s === "light" ? "라이트" : "다크"
              }
            />
          ))}
        </Group>
        <Group label="글자 크기 · 시니어 모드">
          {(["default", "senior"] as FontScale[]).map((f) => (
            <Choice
              key={f}
              active={fontScale === f}
              onClick={() => setFontScale(f)}
              label={f === "default" ? "기본" : "큰 글자 · 큰 버튼"}
            />
          ))}
        </Group>
      </Section>

      <Section title="외부 캘린더 구독">
        <p className="text-sm text-haru-muted mb-3">
          아이폰/안드로이드 캘린더, 구글 캘린더, 네이버 캘린더에서 하루의 할 일을
          읽기 전용으로 구독할 수 있습니다.
        </p>
        <button
          onClick={async () => {
            setCalLoading(true);
            try {
              const r = await api.calendar.subscribeToken();
              setCalLink(r);
            } finally {
              setCalLoading(false);
            }
          }}
          disabled={calLoading}
          className="text-sm px-4 py-2 rounded-md border border-black/10 dark:border-white/15 hover:border-haru-accent disabled:opacity-50"
        >
          {calLoading ? "발급 중…" : "구독 링크 발급"}
        </button>
        {calLink && (
          <div className="mt-3 text-xs space-y-2">
            <div>
              <div className="text-haru-muted">웹 (Google/Naver):</div>
              <code className="break-all">{calLink.ics}</code>
            </div>
            <div>
              <div className="text-haru-muted">iOS/macOS:</div>
              <code className="break-all">{calLink.webcal}</code>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-xs uppercase tracking-widest text-haru-muted mb-3">
        {title}
      </h2>
      <div className="rounded-xl border border-black/5 dark:border-white/10 p-4">
        {children}
      </div>
    </section>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="text-sm mb-2">{label}</div>
      <div className="flex gap-2 flex-wrap">{children}</div>
    </div>
  );
}

function Choice({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
        active
          ? "border-haru-accent text-haru-accent"
          : "border-black/10 dark:border-white/15 hover:border-haru-accent"
      }`}
    >
      {label}
    </button>
  );
}
