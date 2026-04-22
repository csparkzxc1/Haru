import { useMemo } from "react";
import { Screen } from "@/components/Screen";
import { QuickEntry } from "@/components/QuickEntry";
import { TaskRow } from "@/components/TaskRow";
import { isHoliday } from "@haru/shared/korean-calendar";
import { useTasksStore } from "@/store/tasks";
import { filterToday } from "@/utils/task-filters";

export default function TodayScreen() {
  const tasks = useTasksStore((s) => s.tasks);
  const todayTasks = useMemo(() => filterToday(tasks), [tasks]);

  const now = new Date();
  const holiday = isHoliday(now);
  const dateLabel = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(now);

  return (
    <Screen
      title="오늘"
      subtitle={holiday ? `${dateLabel} · ${holiday.name}` : dateLabel}
      count={todayTasks.length}
    >
      <QuickEntry />
      {todayTasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </Screen>
  );
}
