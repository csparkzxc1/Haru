import { QuickEntry } from "@/components/quick-entry";
import { TaskList, type TaskItem } from "@/components/task-list";

const sample: TaskItem[] = [];

export default function SomedayPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">언젠가</h1>
        <p className="text-sm text-haru-muted mt-1">보류 · 영감 보관함</p>
      </header>
      <QuickEntry />
      <TaskList initial={sample} />
    </>
  );
}
