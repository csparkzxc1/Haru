import { Screen } from "@/components/Screen";
import { QuickEntry } from "@/components/QuickEntry";
import { TaskRow } from "@/components/TaskRow";
import { isHoliday } from "@haru/shared/korean-calendar";
import type { TaskItem } from "@/types/task";

const TODAY = new Date().toISOString();

const DUMMY_TASKS: TaskItem[] = [
  { id: "1", title: "주간보고 초안 작성", priority: "high", tags: ["보고"] },
  { id: "2", title: "치과 예약 확정 전화", star: true, tags: ["전화", "15분컷"] },
  { id: "3", title: "아이 학원 라이드", tags: ["가족"] },
  { id: "4", title: "아침 커피콩 주문", done: true, tags: ["집"] },
  { id: "5", title: "토스 카드대금 확인", priority: "high", deadline: TODAY, tags: ["결재대기"] },
];

export default function TodayScreen() {
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
    >
      <QuickEntry />
      {DUMMY_TASKS.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </Screen>
  );
}
