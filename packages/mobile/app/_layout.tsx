import "../global.css";
import { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "../lib/auth";
import { ThemeProvider } from "../lib/theme";
import { LoginScreen } from "../components/LoginScreen";
import { ActivityIndicator, AppState, View } from "react-native";
import { initDb } from "../lib/db";
import { syncNow, clearAfterLogout } from "../lib/sync";
import {
  registerPushTokenWithBackend,
  syncLocalNotifications,
} from "../lib/notifications";
import { useIsTablet } from "../lib/responsive";
import { TabletSidebar } from "../components/SplitView";
import * as Linking from "expo-linking";
import { handleDeepLink } from "../lib/deep-link";

/**
 * 태블릿(>= 768pt 가로)이면 사이드바 옆에 콘텐츠. 폰이면 그대로 통과 →
 * 하단 탭바가 따로 깔린다.
 */
function MaybeSplitView({ children }: { children: React.ReactNode }) {
  const isTablet = useIsTablet();
  if (!isTablet) return <>{children}</>;
  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <TabletSidebar />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

function AuthedShell({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();

  useEffect(() => {
    let active = true;
    (async () => {
      await initDb();
      await syncNow();
      await syncLocalNotifications();
      if (active) qc.invalidateQueries({ queryKey: ["local-tasks"] });
      // 푸시 토큰 등록은 권한 요청이 따르므로 비동기·실패 허용.
      void registerPushTokenWithBackend();
    })();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void syncNow().then(() => {
          qc.invalidateQueries({ queryKey: ["local-tasks"] });
          void syncLocalNotifications();
        });
      }
    });

    // Deep link (haru://add?title=...) — Shortcuts/Tauri/타 앱에서 호출
    const linkSub = Linking.addEventListener("url", (event) => {
      void handleDeepLink({ url: event.url }).then(() =>
        qc.invalidateQueries({ queryKey: ["local-tasks"] }),
      );
    });
    Linking.getInitialURL().then((url) => {
      if (url) void handleDeepLink({ url });
    });

    return () => {
      active = false;
      sub.remove();
      linkSub.remove();
    };
  }, [qc]);

  return <MaybeSplitView>{children}</MaybeSplitView>;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-haru-paper dark:bg-haru-ink">
        <ActivityIndicator color="#FF6B35" />
      </View>
    );
  }
  if (!user) return <LoginScreen />;
  return <AuthedShell>{children}</AuthedShell>;
}

function AppTabs() {
  const isTablet = useIsTablet();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF6B35",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: isTablet
          ? { display: "none" }
          : { borderTopColor: "rgba(0,0,0,0.05)" },
        tabBarLabelStyle: { fontSize: 11, letterSpacing: -0.2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "오늘" }} />
      <Tabs.Screen name="this-week" options={{ title: "이번주" }} />
      <Tabs.Screen name="upcoming" options={{ title: "예정" }} />
      <Tabs.Screen name="anytime" options={{ title: "언제든지" }} />
      <Tabs.Screen name="someday" options={{ title: "언젠가" }} />
      <Tabs.Screen name="settings" options={{ title: "설정" }} />
    </Tabs>
  );
}

export default function Layout() {
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 5_000, retry: 1 } },
      }),
  );

  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <AuthProvider onLogout={clearAfterLogout}>
          <StatusBar style="auto" />
          <AuthGate>
            <AppTabs />
          </AuthGate>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
