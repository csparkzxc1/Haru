import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { TaskItem } from "@/types/task";

function deadlineLabel(deadline: string): string {
  const d = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  d.setHours(0, 0, 0, 0);

  if (d.getTime() === today.getTime()) return "오늘 마감";
  if (d.getTime() === tomorrow.getTime()) return "내일 마감";
  return `${d.getMonth() + 1}/${d.getDate()} 마감`;
}

export function TaskRow({ task }: { task: TaskItem }) {
  const [done, setDone] = useState(task.done ?? false);
  const starred = task.star ?? false;

  const checkboxStyle = done
    ? "bg-haru-accent border-haru-accent"
    : starred
    ? "bg-yellow-400 border-yellow-400"
    : "border-haru-muted";

  return (
    <Pressable
      onPress={() => setDone((d) => !d)}
      className="flex-row items-start gap-3 py-3 border-b border-black/5"
    >
      <View
        className={`mt-0.5 h-5 w-5 rounded-full border items-center justify-center ${checkboxStyle}`}
      >
        {done && <Text className="text-white text-xs">✓</Text>}
        {!done && starred && <Text className="text-white text-xs">★</Text>}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-1">
          {task.priority === "high" && !done && (
            <Text className="text-[#E04E2A] text-xs font-bold">!!</Text>
          )}
          <Text
            className={`text-[15px] text-haru-ink dark:text-haru-paper ${
              done ? "line-through text-haru-muted" : ""
            }`}
          >
            {task.title}
          </Text>
        </View>

        {(task.when || task.tags?.length || task.deadline) && (
          <View className="flex-row flex-wrap gap-2 mt-1">
            {task.when && (
              <Text className="text-xs text-haru-muted">
                📅 {new Date(task.when).toLocaleDateString("ko-KR")}
              </Text>
            )}
            {task.deadline && !done && (
              <View className="px-1.5 py-0.5 rounded bg-[#E04E2A]/10">
                <Text className="text-xs text-[#E04E2A]">
                  ⏰ {deadlineLabel(task.deadline)}
                </Text>
              </View>
            )}
            {task.tags?.map((t) => (
              <Text key={t} className="text-xs text-haru-muted">
                #{t}
              </Text>
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}
