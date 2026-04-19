import { TaskList, type TaskItem } from "@/components/task-list";

const sample: TaskItem[] = [
  { id: "c", title: "사분기 회고 제출", completed: true },
];

export default function LogbookPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">로그북</h1>
        <p className="text-sm text-haru-muted mt-1">완료한 할 일 · 최근순</p>
      </header>
      <TaskList initial={sample} />
    </>
  );
}
