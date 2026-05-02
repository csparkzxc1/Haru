import { QuickEntry } from "@/components/quick-entry";
import { TaskList } from "@/components/task-list";
import { isHoliday } from "@haru/shared/korean-calendar";

export default function TodayPage() {
  const now = new Date();
  const holiday = isHoliday(now);
  const weekday = new Intl.DateTimeFormat("ko-KR", { weekday: "long" }).format(now);
  const md = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }).format(now);

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">오늘</h1>
        <p className="text-sm text-haru-muted mt-1">
          {md} {weekday}
          {holiday && <span className="ml-2 text-haru-accent">· {holiday.name}</span>}
        </p>
      </header>
      <QuickEntry />
      <TaskList view="today" />
    </>
  );
}
