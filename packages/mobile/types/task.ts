export interface TaskItem {
  id: string;
  title: string;
  when?: string | null;
  tags?: string[];

  // 우선순위 & 중요도
  star?: boolean;
  priority?: "high" | "normal";

  // 마감
  deadline?: string | null;

  // 상태
  done?: boolean;
  doneAt?: string | null;

  // 메타 (나중에 스토어에서 사용)
  areaId?: string | null;
  projectId?: string | null;
  createdAt?: string;
}

export type TaskFilter = "today" | "this-week" | "upcoming" | "anytime" | "someday" | "logbook";
