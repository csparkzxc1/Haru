import { useMemo } from "react";
import { Screen } from "@/components/Screen";
import { TaskRow } from "@/components/TaskRow";
import { useTasksStore } from "@/store/tasks";
import { filterSomeday } from "@/utils/task-filters";

export default function SomedayScreen() {
  const tasks = useTasksStore((s) => s.tasks);
  const somedayTasks = useMemo(() => filterSomeday(tasks), [tasks]);

  return (
    <Screen title="언젠가" subtitle="보류 · 영감 보관함">
      {somedayTasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </Screen>
  );
}
