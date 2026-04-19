import { QuickEntry } from "@/components/quick-entry";
import { TaskList, type TaskItem } from "@/components/task-list";

const sample: TaskItem[] = [];

export default function AnytimePage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">언제든지</h1>
        <p className="text-sm text-haru-muted mt-1">시간 지정 없음 · 활성 할 일</p>
      </header>
      <QuickEntry />
      <TaskList initial={sample} />
    </>
  );
}
