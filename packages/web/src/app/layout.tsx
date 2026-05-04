import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { QueryProvider } from "@/lib/query-client";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme";

const SITE_URL = process.env.NEXT_PUBLIC_WEB_BASE ?? "https://haru.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "하루 — 한국형 To-Do",
    template: "%s · 하루",
  },
  description:
    "Things의 미니멀 철학, 한국의 문화. 자연어 입력, 음력 생일, 공휴일, 가족 공유, 경조사 매니저까지.",
  manifest: "/manifest.json",
  applicationName: "하루",
  authors: [{ name: "Haru" }],
  keywords: [
    "할 일",
    "투두",
    "할 일 관리",
    "일정",
    "스케줄",
    "플래너",
    "GTD",
    "생산성",
    "한국형",
    "음력",
    "공휴일",
    "경조사",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "하루",
    title: "하루 — 한국형 To-Do",
    description:
      "Things의 미니멀 철학, 한국의 문화. 음력·공휴일·경조사까지 챙기는 한국형 할 일 앱.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "하루 — 한국형 To-Do",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "하루 — 한국형 To-Do",
    description:
      "Things의 미니멀 철학, 한국의 문화. 음력·공휴일·경조사까지 챙기는 한국형 할 일 앱.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "ko-KR": SITE_URL,
      "ja-JP": `${SITE_URL}/ja`,
    },
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF7" },
    { media: "(prefers-color-scheme: dark)", color: "#1C1C1E" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <AppShell>{children}</AppShell>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
