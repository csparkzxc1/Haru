import { Pressable, Text, View } from "react-native";
import type { ApiTask } from "../lib/api";

export function TaskRow({
  task,
  onToggle,
}: {
  task: ApiTask;
  onToggle: (task: ApiTask) => void;
}) {
  const done = task.status !== "OPEN";
  const tags = task.taskTags.map((tt) => tt.tag.name);
  return (
    <Pressable
      onPress={() => onToggle(task)}
      className="flex-row items-start gap-3 py-3 border-b border-black/5"
    >
      <View
        className={`mt-0.5 h-5 w-5 rounded-full border items-center justify-center ${
          done ? "bg-haru-accent border-haru-accent" : "border-haru-muted"
        }`}
      >
        {done && <Text className="text-white text-xs">✓</Text>}
      </View>
      <View className="flex-1">
        <Text
          className={`text-[15px] text-haru-ink dark:text-haru-paper ${
            done ? "line-through text-haru-muted" : ""
          }`}
        >
          {task.title}
        </Text>
        {(task.when || task.deadline || tags.length > 0) && (
          <View className="flex-row flex-wrap gap-2 mt-1">
            {task.when && (
              <Text className="text-xs text-haru-muted">
                📅 {new Date(task.when).toLocaleDateString("ko-KR")}
              </Text>
            )}
            {task.deadline && (
              <Text className="text-xs text-haru-muted">
                ⏰ {new Date(task.deadline).toLocaleDateString("ko-KR")}
              </Text>
            )}
            {tags.map((t) => (
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
