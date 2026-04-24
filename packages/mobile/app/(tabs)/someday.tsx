import { useMemo } from "react";
import { Screen } from "@/components/Screen";
import { TaskRow } from "@/components/TaskRow";
import { EmptyState } from "@/components/EmptyState";
import { useTasksStore } from "@/store/tasks";
import { filterSomeday } from "@/utils/task-filters";

export default function SomedayScreen() {
  const tasks = useTasksStore((s) => s.tasks);
  const somedayTasks = useMemo(() => filterSomeday(tasks), [tasks]);

  return (
    <Screen title="언젠가" subtitle="보류 · 영감 보관함" count={somedayTasks.length}>
      {somedayTasks.length === 0 ? (
        <EmptyState emoji="✨" message="나중에 하고 싶은 일을" hint="여기에 적어두세요" />
      ) : (
        somedayTasks.map((task) => <TaskRow key={task.id} task={task} />)
      )}
    </Screen>
  );
}
