/**
 * 공통 셸 — 각 목업 파일이 단 1번 호출하면 sidebar + tailwind config 가
 * 자동 주입된다. components/sidebar.tsx 와 동일한 구조.
 *
 * 사용:
 *   <script src="_shell.js" data-active="today"></script>
 *   <div class="flex min-h-screen">
 *     <aside id="sidebar"></aside>
 *     <main class="flex-1 px-8 py-10 max-w-3xl mx-auto"> ... </main>
 *   </div>
 */
(function () {
  const NAV = [
    { key: "inbox", href: "#", label: "수신함", icon: "✉︎" },
    { key: "today", href: "web-today.html", label: "오늘", icon: "☀︎" },
    { key: "thisWeek", href: "web-this-week.html", label: "이번주", icon: "▦" },
    { key: "upcoming", href: "#", label: "예정", icon: "▷" },
    { key: "anytime", href: "#", label: "언제든지", icon: "∞" },
    { key: "someday", href: "#", label: "언젠가", icon: "✧" },
    { key: "logbook", href: "#", label: "로그북", icon: "✓" },
  ];
  const EXTRA = [
    { key: "areas", href: "web-areas.html", label: "영역" },
    { key: "family-events", href: "web-family-events.html", label: "경조사·축의금" },
    { key: "ai", href: "web-ai-organize.html", label: "AI 어시스턴트" },
    { key: "settings", href: "web-settings.html", label: "설정" },
  ];

  // Tailwind config (실제 packages/web/tailwind.config.ts 토큰)
  const tailwindConfig = {
    theme: {
      extend: {
        fontFamily: {
          sans: [
            "Pretendard",
            "-apple-system",
            "BlinkMacSystemFont",
            "system-ui",
            "Apple SD Gothic Neo",
            "Noto Sans KR",
            "sans-serif",
          ],
        },
        colors: {
          haru: {
            ink: "#1C1C1E",
            paper: "#FAFAF7",
            accent: "#FF6B35",
            muted: "#8E8E93",
          },
        },
        letterSpacing: { korean: "-0.01em" },
      },
    },
  };

  function applyTailwindConfig() {
    if (typeof window === "undefined") return;
    if (window.tailwind && typeof window.tailwind === "object") {
      window.tailwind.config = tailwindConfig;
    } else {
      // Tailwind CDN 가 아직 로드되지 않은 경우 — script 로드 후 재시도
      const handler = setInterval(() => {
        if (window.tailwind) {
          window.tailwind.config = tailwindConfig;
          clearInterval(handler);
        }
      }, 30);
    }
  }

  function navItem(item, active) {
    const cls = item.key === active
      ? "bg-black/5"
      : "hover:bg-black/5";
    return `
      <a href="${item.href}"
         class="flex items-center gap-3 px-3 py-2 rounded-md text-sm ${cls}">
        <span class="text-haru-muted w-4 text-center">${item.icon}</span>
        <span>${item.label}</span>
      </a>`;
  }

  function extraItem(item, active) {
    const cls = item.key === active
      ? "bg-black/5 text-haru-accent"
      : "hover:bg-black/5";
    return `
      <a href="${item.href}"
         class="block px-3 py-2 rounded-md text-sm ${cls}">${item.label}</a>`;
  }

  function renderSidebar(active, nickname = "데모 사용자") {
    return `
      <div class="text-xl font-semibold mb-8 tracking-tight">하루</div>
      <nav class="space-y-0.5">
        ${NAV.map((i) => navItem(i, active)).join("")}
      </nav>

      <div class="mt-10 text-xs text-haru-muted uppercase tracking-widest px-3 mb-2">한국 특화</div>
      <nav class="space-y-0.5">
        ${EXTRA.map((i) => extraItem(i, active)).join("")}
      </nav>

      <div class="mt-auto pt-8">
        <div class="px-3 py-2 mb-2 text-xs">
          <div class="text-haru-muted">로그인됨</div>
          <div class="truncate">${nickname}</div>
          <button class="mt-2 text-haru-muted hover:text-haru-accent">로그아웃</button>
        </div>
        <div class="px-3 text-xs text-haru-muted/80 space-x-3">
          <a href="#" class="hover:text-haru-accent">개인정보처리방침</a>
          <a href="#" class="hover:text-haru-accent">이용약관</a>
        </div>
      </div>`;
  }

  function init() {
    applyTailwindConfig();
    const script = document.currentScript || Array.from(document.scripts).pop();
    const active = script?.dataset.active ?? "";

    const apply = () => {
      const aside = document.getElementById("sidebar");
      if (aside) {
        aside.className =
          "w-60 shrink-0 border-r border-black/5 px-4 py-8 flex flex-col";
        aside.innerHTML = renderSidebar(active);
      }
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", apply);
    } else {
      apply();
    }
  }

  init();
})();
