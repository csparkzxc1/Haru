import "../global.css";
import { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "../lib/auth";
import { LoginScreen } from "../components/LoginScreen";
import { ActivityIndicator, AppState, View } from "react-native";
import { initDb } from "../lib/db";
import { syncNow, clearAfterLogout } from "../lib/sync";
import {
  registerPushTokenWithBackend,
  syncLocalNotifications,
} from "../lib/notifications";

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

    return () => {
      active = false;
      sub.remove();
    };
  }, [qc]);

  return <>{children}</>;
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

export default function Layout() {
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 5_000, retry: 1 } },
      }),
  );

  return (
    <QueryClientProvider client={qc}>
      <AuthProvider onLogout={clearAfterLogout}>
        <StatusBar style="auto" />
        <AuthGate>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: "#FF6B35",
              tabBarInactiveTintColor: "#8E8E93",
              tabBarStyle: { borderTopColor: "rgba(0,0,0,0.05)" },
              tabBarLabelStyle: { fontSize: 11, letterSpacing: -0.2 },
            }}
          >
            <Tabs.Screen name="index" options={{ title: "오늘" }} />
            <Tabs.Screen name="this-week" options={{ title: "이번주" }} />
            <Tabs.Screen name="upcoming" options={{ title: "예정" }} />
            <Tabs.Screen name="anytime" options={{ title: "언제든지" }} />
            <Tabs.Screen name="someday" options={{ title: "언젠가" }} />
          </Tabs>
        </AuthGate>
      </AuthProvider>
    </QueryClientProvider>
  );
}
