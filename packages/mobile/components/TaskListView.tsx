import { ActivityIndicator, Text, View } from "react-native";
import type { ApiTask, ViewKind } from "../lib/api";
import {
  useCompleteTask,
  useTasks,
  useUncompleteTask,
} from "../lib/hooks";
import { TaskRow } from "./TaskRow";

export function TaskListView({ view }: { view: ViewKind }) {
  const { data, isLoading, error } = useTasks(view);
  const complete = useCompleteTask();
  const uncomplete = useUncompleteTask();

  if (isLoading) {
    return (
      <View className="py-12 items-center">
        <ActivityIndicator color="#FF6B35" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="py-6 px-4 rounded-lg bg-red-50">
        <Text className="text-sm text-red-700">
          백엔드 연결 실패: {(error as Error).message}
        </Text>
      </View>
    );
  }

  const tasks = data ?? [];
  if (tasks.length === 0) {
    return (
      <Text className="py-12 text-center text-sm text-haru-muted">
        할 일이 없습니다.
      </Text>
    );
  }

  function onToggle(t: ApiTask) {
    if (t.status === "OPEN") complete.mutate(t.id);
    else uncomplete.mutate(t.id);
  }

  return (
    <View>
      {tasks.map((t) => (
        <TaskRow key={t.id} task={t} onToggle={onToggle} />
      ))}
    </View>
  );
}
