import { Screen } from "../components/Screen";
import { QuickEntry } from "../components/QuickEntry";
import { TaskListView } from "../components/TaskListView";

export default function AnytimeScreen() {
  return (
    <Screen title="언제든지" subtitle="시간 지정 없음 · 활성 할 일">
      <QuickEntry />
      <TaskListView view="anytime" />
    </Screen>
  );
}
