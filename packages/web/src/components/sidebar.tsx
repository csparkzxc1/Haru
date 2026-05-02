"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { href: "/inbox", label: "수신함", icon: "✉︎" },
  { href: "/today", label: "오늘", icon: "☀︎" },
  { href: "/this-week", label: "이번주", icon: "▦" },
  { href: "/upcoming", label: "예정", icon: "▷" },
  { href: "/anytime", label: "언제든지", icon: "∞" },
  { href: "/someday", label: "언젠가", icon: "✧" },
  { href: "/logbook", label: "로그북", icon: "✓" },
] as const;

const EXTRA = [
  { href: "/areas", label: "영역" },
  { href: "/family-events", label: "경조사·축의금" },
  { href: "/settings", label: "설정" },
] as const;

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-60 shrink-0 border-r border-black/5 dark:border-white/10 px-4 py-8 flex flex-col">
      <div className="text-xl font-semibold mb-8 tracking-tight">하루</div>
      <nav className="space-y-0.5">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-black/5 dark:hover:bg-white/5"
          >
            <span className="text-haru-muted w-4 text-center">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-10 text-xs text-haru-muted uppercase tracking-widest px-3 mb-2">
        한국 특화
      </div>
      <nav className="space-y-0.5">
        {EXTRA.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-3 py-2 rounded-md text-sm hover:bg-black/5 dark:hover:bg-white/5"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-8">
        {user && (
          <div className="px-3 py-2 mb-2 text-xs">
            <div className="text-haru-muted">로그인됨</div>
            <div className="truncate">{user.nickname}</div>
            <button
              onClick={() => logout()}
              className="mt-2 text-haru-muted hover:text-haru-accent"
            >
              로그아웃
            </button>
          </div>
        )}
        <div className="px-3 text-xs text-haru-muted/80 space-x-3">
          <Link href="/privacy" className="hover:text-haru-accent">
            개인정보처리방침
          </Link>
          <Link href="/terms" className="hover:text-haru-accent">
            이용약관
          </Link>
        </div>
      </div>
    </aside>
  );
}
