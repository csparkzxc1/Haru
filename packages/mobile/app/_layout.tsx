import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, headerBackTitle: "" }} />
        <Stack.Screen
          name="task/[id]"
          options={{
            title: "할 일",
            headerShown: true,
            presentation: "card",
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
