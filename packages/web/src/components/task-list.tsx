"use client";
import { useState } from "react";
import clsx from "clsx";

export interface TaskItem {
  id: string;
  title: string;
  when?: string | null;
  deadline?: string | null;
  tags?: string[];
  completed?: boolean;
}

export function TaskList({ initial }: { initial: TaskItem[] }) {
  const [tasks, setTasks] = useState(initial);

  const toggle = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  if (!tasks.length) {
    return (
      <div className="text-haru-muted text-sm py-12 text-center">
        할 일이 없습니다. 아래 빠른 입력으로 새 할 일을 추가해 보세요.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-black/5 dark:divide-white/10">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-start gap-3 py-3">
          <button
            aria-label={task.completed ? "완료 취소" : "완료"}
            onClick={() => toggle(task.id)}
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
                  <span key={t} className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
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
