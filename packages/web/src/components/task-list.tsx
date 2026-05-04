"use client";

import clsx from "clsx";
import { useState } from "react";
import type { ApiTask, ViewKind } from "@/lib/api";
import {
  useCompleteTask,
  useDeleteTask,
  useTasks,
  useUncompleteTask,
} from "@/lib/hooks";

export interface TaskItem {
  id: string;
  title: string;
  when?: string | null;
  deadline?: string | null;
  tags?: string[];
  completed?: boolean;
}

function toItem(t: ApiTask): TaskItem {
  return {
    id: t.id,
    title: t.title,
    when: t.when,
    deadline: t.deadline,
    tags: t.taskTags.map((tt) => tt.tag.name),
    completed: t.status === "COMPLETED" || t.status === "CANCELED",
  };
}

export function TaskList({ view }: { view: ViewKind }) {
  const { data, isLoading, error } = useTasks(view);
  const complete = useCompleteTask();
  const uncomplete = useUncompleteTask();
  const remove = useDeleteTask();
  const [hovered, setHovered] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="text-haru-muted text-sm py-12 text-center" role="status">
        불러오는 중…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm py-6 px-4 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300">
        백엔드에 연결할 수 없습니다. <code className="font-mono">pnpm --filter @haru/backend dev</code>를 실행해 주세요.
        <div className="mt-1 text-xs opacity-70">{(error as Error).message}</div>
      </div>
    );
  }

  const tasks = (data ?? []).map(toItem);

  if (!tasks.length) {
    return (
      <div className="text-haru-muted text-sm py-12 text-center">
        할 일이 없습니다. 위 빠른 입력으로 새 할 일을 추가해 보세요.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-black/5 dark:divide-white/10">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex items-start gap-3 py-3 group"
          onMouseEnter={() => setHovered(task.id)}
          onMouseLeave={() => setHovered((cur) => (cur === task.id ? null : cur))}
        >
          <button
            aria-label={task.completed ? "완료 취소" : "완료"}
            onClick={() =>
              task.completed
                ? uncomplete.mutate(task.id)
                : complete.mutate(task.id)
            }
            className={clsx(
              "mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center transition-colors",
              task.completed
                ? "bg-haru-accent border-haru-accent text-white"
                : "border-haru-muted/50 hover:border-haru-accent",
            )}
          >
            {task.completed ? "✓" : ""}
          </button>
          <div className="flex-1">
            <div
              className={clsx(
                "text-[15px]",
                task.completed && "line-through text-haru-muted",
              )}
            >
              {task.title}
            </div>
            {(task.when || task.deadline || task.tags?.length) && (
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-haru-muted">
                {task.when && <span>📅 {formatKst(task.when)}</span>}
                {task.deadline && <span>⏰ 마감 {formatKst(task.deadline)}</span>}
                {task.tags?.map((t) => (
                  <span
                    key={t}
                    className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
          {hovered === task.id && (
            <button
              aria-label="삭제"
              onClick={() => {
                if (confirm("이 할 일을 삭제할까요?")) remove.mutate(task.id);
              }}
              className="text-xs text-haru-muted hover:text-red-500 transition-colors px-2 py-1"
            >
              삭제
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

function formatKst(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).format(d);
}
