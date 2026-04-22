import { Text, View } from "react-native";
import { isHoliday } from "@haru/shared/korean-calendar";

export function TodayHeader({ count }: { count?: number }) {
  const today = new Date();
  const holiday = isHoliday(today);
  const dateLabel = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(today);

  return (
    <View className="mb-6">
      <Text className="text-2xl font-bold text-haru-ink dark:text-haru-paper tracking-tight">
        {dateLabel}
      </Text>

      <View className="flex-row items-center justify-between mt-2">
        <View className="flex-row items-baseline">
          <Text className="text-lg text-haru-muted">오늘</Text>
          {count != null && count > 0 && (
            <Text className="text-lg text-haru-muted ml-2">{count}</Text>
          )}
        </View>

        {holiday && (
          <View className="px-2.5 py-1 rounded-full bg-haru-accent/10">
            <Text className="text-xs text-haru-accent font-medium">
              🎌 {holiday.name}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
