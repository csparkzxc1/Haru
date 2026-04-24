import { useMemo } from "react";
import { Screen } from "@/components/Screen";
import { QuickEntry } from "@/components/QuickEntry";
import { TaskRow } from "@/components/TaskRow";
import { EmptyState } from "@/components/EmptyState";
import { useTasksStore } from "@/store/tasks";
import { filterUpcoming } from "@/utils/task-filters";

export default function UpcomingScreen() {
  const tasks = useTasksStore((s) => s.tasks);
  const upcomingTasks = useMemo(() => filterUpcoming(tasks), [tasks]);

  return (
    <Screen title="예정" subtitle="앞으로의 할 일" count={upcomingTasks.length}>
      <QuickEntry />
      {upcomingTasks.length === 0 ? (
        <EmptyState emoji="📅" message="예정된 할 일이 아직 없어요" />
      ) : (
        upcomingTasks.map((task) => <TaskRow key={task.id} task={task} />)
      )}
    </Screen>
  );
}
