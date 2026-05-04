import { QuickEntry } from "@/components/quick-entry";
import { TaskList } from "@/components/task-list";

export default function InboxPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">수신함</h1>
        <p className="text-sm text-haru-muted mt-1">
          분류 전 · 영역·프로젝트 미배정 활성 항목
        </p>
      </header>
      <QuickEntry />
      <TaskList view="inbox" />
    </>
  );
}
