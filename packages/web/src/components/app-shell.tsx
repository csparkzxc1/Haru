"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/lib/auth-context";

const FULL_BLEED = new Set(["/login", "/register", "/auth/callback"]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const fullBleed = pathname && FULL_BLEED.has(pathname);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-haru-muted text-sm">
        불러오는 중…
      </div>
    );
  }

  if (fullBleed || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-8 py-10 max-w-3xl mx-auto">{children}</main>
    </div>
  );
}
