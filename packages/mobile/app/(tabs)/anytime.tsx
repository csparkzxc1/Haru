import { useMemo } from "react";
import { Screen } from "@/components/Screen";
import { QuickEntry } from "@/components/QuickEntry";
import { TaskRow } from "@/components/TaskRow";
import { EmptyState } from "@/components/EmptyState";
import { useTasksStore } from "@/store/tasks";
import { filterAnytime } from "@/utils/task-filters";

export default function AnytimeScreen() {
  const tasks = useTasksStore((s) => s.tasks);
  const anytimeTasks = useMemo(() => filterAnytime(tasks), [tasks]);

  return (
    <Screen title="언제든지" subtitle="시간 지정 없음 · 활성 할 일" count={anytimeTasks.length}>
      <QuickEntry />
      {anytimeTasks.length === 0 ? (
        <EmptyState emoji="🌊" message="여유 시간이 생기면" hint="할 일을 담아두세요" />
      ) : (
        anytimeTasks.map((task) => <TaskRow key={task.id} task={task} />)
      )}
    </Screen>
  );
}
