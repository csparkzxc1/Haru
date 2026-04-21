import { useMemo } from "react";
import { Screen } from "@/components/Screen";
import { QuickEntry } from "@/components/QuickEntry";
import { TaskRow } from "@/components/TaskRow";
import { useTasksStore } from "@/store/tasks";
import { filterThisWeek } from "@/utils/task-filters";

export default function ThisWeekScreen() {
  const tasks = useTasksStore((s) => s.tasks);
  const weekTasks = useMemo(() => filterThisWeek(tasks), [tasks]);

  return (
    <Screen title="이번주" subtitle="한국 직장인 선호 뷰 · 월~일">
      <QuickEntry />
      {weekTasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </Screen>
  );
}
