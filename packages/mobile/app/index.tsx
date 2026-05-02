import { Pressable, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { QuickEntry } from "../components/QuickEntry";
import { TaskListView } from "../components/TaskListView";
import { isHoliday } from "@haru/shared/korean-calendar";
import { useAuth } from "../lib/auth";

export default function TodayScreen() {
  const now = new Date();
  const holiday = isHoliday(now);
  const dateLabel = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(now);
  const { user, logout } = useAuth();

  return (
    <Screen
      title="오늘"
      subtitle={holiday ? `${dateLabel} · ${holiday.name}` : dateLabel}
    >
      <QuickEntry />
      <TaskListView view="today" />
      <View className="mt-10 pt-4 border-t border-black/5">
        <Text className="text-xs text-haru-muted">
          로그인됨 · {user?.nickname}
        </Text>
        <Pressable onPress={() => logout()} className="mt-2">
          <Text className="text-xs text-haru-accent">로그아웃</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
