import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "하루 — 한국형 To-Do",
  description: "한국인을 위한 미니멀 할 일 관리 · Things의 철학, 한국의 문화",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 px-8 py-10 max-w-3xl mx-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
