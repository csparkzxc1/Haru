import { QuickEntry } from "@/components/quick-entry";
import { TaskList, type TaskItem } from "@/components/task-list";
import { isHoliday } from "@haru/shared/korean-calendar";

const sampleToday: TaskItem[] = [
  { id: "1", title: "주간보고 초안 작성", when: new Date().toISOString(), tags: ["보고"] },
  { id: "2", title: "치과 예약 확정 전화", when: new Date().toISOString(), tags: ["전화", "15분컷"] },
];

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
      <TaskList initial={sampleToday} />
    </>
  );
}
