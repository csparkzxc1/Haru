import { Screen } from "../components/Screen";
import { QuickEntry } from "../components/QuickEntry";
import { TaskListView } from "../components/TaskListView";

export default function SomedayScreen() {
  return (
    <Screen title="언젠가" subtitle="보류 · 영감 보관함">
      <QuickEntry />
      <TaskListView view="someday" />
    </Screen>
  );
}
