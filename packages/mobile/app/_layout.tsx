import "../global.css";
import { useState } from "react";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "../lib/auth";
import { LoginScreen } from "../components/LoginScreen";
import { ActivityIndicator, View } from "react-native";

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
  return <>{children}</>;
}

export default function Layout() {
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
      }),
  );

  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
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
