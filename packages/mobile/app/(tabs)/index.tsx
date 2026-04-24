import { useMemo } from "react";
import { Screen } from "@/components/Screen";
import { QuickEntry } from "@/components/QuickEntry";
import { TaskRow } from "@/components/TaskRow";
import { EmptyState } from "@/components/EmptyState";
import { TodayHeader } from "@/components/TodayHeader";
import { useTasksStore } from "@/store/tasks";
import { filterToday } from "@/utils/task-filters";

export default function TodayScreen() {
  const tasks = useTasksStore((s) => s.tasks);
  const todayTasks = useMemo(() => filterToday(tasks), [tasks]);

  return (
    <Screen>
      <TodayHeader count={todayTasks.length} />
      <QuickEntry />
      {todayTasks.length === 0 ? (
        <EmptyState emoji="☕" message="오늘은 할 일이 없어요" hint="푹 쉬어가요" />
      ) : (
        todayTasks.map((task) => <TaskRow key={task.id} task={task} />)
      )}
    </Screen>
  );
}
