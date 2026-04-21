import { Screen } from "@/components/Screen";
import { QuickEntry } from "@/components/QuickEntry";
import { TaskRow } from "@/components/TaskRow";

export default function ThisWeekScreen() {
  return (
    <Screen title="이번주" subtitle="한국 직장인 선호 뷰 · 월~일">
      <QuickEntry />
      <TaskRow task={{ id: "a", title: "팀 회의", tags: ["회의"] }} />
      <TaskRow task={{ id: "b", title: "주간보고 제출", tags: ["보고"] }} />
    </Screen>
  );
}
