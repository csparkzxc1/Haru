import Link from "next/link";

const NAV = [
  { href: "/today", label: "오늘", icon: "☀︎" },
  { href: "/this-week", label: "이번주", icon: "▦" },
  { href: "/upcoming", label: "예정", icon: "▷" },
  { href: "/anytime", label: "언제든지", icon: "∞" },
  { href: "/someday", label: "언젠가", icon: "✧" },
  { href: "/logbook", label: "로그북", icon: "✓" },
] as const;

export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-black/5 dark:border-white/10 px-4 py-8">
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
      <div className="mt-10 text-xs text-haru-muted uppercase tracking-widest px-3 mb-2">영역</div>
      <nav className="space-y-0.5">
        <Link href="/areas" className="block px-3 py-2 rounded-md text-sm hover:bg-black/5 dark:hover:bg-white/5">
          + 새 영역
        </Link>
      </nav>
    </aside>
  );
}
