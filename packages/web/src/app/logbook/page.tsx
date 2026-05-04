import { TaskList } from "@/components/task-list";

export default function LogbookPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">로그북</h1>
        <p className="text-sm text-haru-muted mt-1">완료한 할 일 · 최근순</p>
      </header>
      <TaskList view="logbook" />
    </>
  );
}
