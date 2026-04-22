import { useMemo } from "react";
import { Screen } from "@/components/Screen";
import { QuickEntry } from "@/components/QuickEntry";
import { TaskRow } from "@/components/TaskRow";
import { EmptyState } from "@/components/EmptyState";
import { useTasksStore } from "@/store/tasks";
import { filterThisWeek } from "@/utils/task-filters";

export default function ThisWeekScreen() {
  const tasks = useTasksStore((s) => s.tasks);
  const weekTasks = useMemo(() => filterThisWeek(tasks), [tasks]);

  return (
    <Screen title="이번주" subtitle="한국 직장인 선호 뷰 · 월~일" count={weekTasks.length}>
      <QuickEntry />
      {weekTasks.length === 0 ? (
        <EmptyState emoji="🌱" message="이번주는 여유로워요" hint="새 할 일을 추가해볼까요?" />
      ) : (
        weekTasks.map((task) => <TaskRow key={task.id} task={task} />)
      )}
    </Screen>
  );
}
