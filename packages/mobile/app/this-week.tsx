import { Screen } from "../components/Screen";
import { QuickEntry } from "../components/QuickEntry";
import { TaskListView } from "../components/TaskListView";

export default function ThisWeekScreen() {
  return (
    <Screen title="이번주" subtitle="한국 직장인 선호 뷰 · 월~일">
      <QuickEntry />
      <TaskListView view="thisWeek" />
    </Screen>
  );
}
