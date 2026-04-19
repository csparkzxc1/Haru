import { QuickEntry } from "@/components/quick-entry";
import { TaskList, type TaskItem } from "@/components/task-list";

const sample: TaskItem[] = [];

export default function UpcomingPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">예정</h1>
        <p className="text-sm text-haru-muted mt-1">앞으로 할 일들</p>
      </header>
      <QuickEntry />
      <TaskList initial={sample} />
    </>
  );
}
