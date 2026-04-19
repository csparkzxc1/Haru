import "../global.css";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function Layout() {
  return (
    <>
      <StatusBar style="auto" />
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
    </>
  );
}
