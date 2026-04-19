import { Screen } from "@/../components/Screen";
import { QuickEntry } from "@/../components/QuickEntry";
import { TaskRow } from "@/../components/TaskRow";
import { isHoliday } from "@haru/shared/korean-calendar";

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
      <TaskRow task={{ id: "1", title: "주간보고 초안 작성", tags: ["보고"] }} />
      <TaskRow task={{ id: "2", title: "치과 예약 확정 전화", tags: ["전화", "15분컷"] }} />
    </Screen>
  );
}
