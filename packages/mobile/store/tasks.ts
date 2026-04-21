import { create } from "zustand";
import type { TaskItem } from "@/types/task";

const today = new Date();
const fmt = (d: Date) => d.toISOString();
const daysFromNow = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return fmt(d);
};

const INITIAL_TASKS: TaskItem[] = [
  // 오늘 마감
  {
    id: "t1",
    title: "토스 카드대금 확인",
    priority: "high",
    deadline: daysFromNow(0),
    tags: ["결재대기"],
    createdAt: fmt(today),
  },
  {
    id: "t2",
    title: "주간보고 초안 작성",
    priority: "high",
    deadline: daysFromNow(0),
    tags: ["보고"],
    createdAt: fmt(today),
  },
  {
    id: "t3",
    title: "치과 예약 확정 전화",
    star: true,
    deadline: daysFromNow(0),
    tags: ["전화", "15분컷"],
    createdAt: fmt(today),
  },

  // 이번주 (2~6일 후)
  {
    id: "t4",
    title: "팀 회의 자료 준비",
    when: daysFromNow(2),
    tags: ["회의"],
    createdAt: fmt(today),
  },
  {
    id: "t5",
    title: "아이 학원비 이체",
    priority: "high",
    when: daysFromNow(3),
    tags: ["가족", "결재대기"],
    createdAt: fmt(today),
  },
  {
    id: "t6",
    title: "주간보고 제출",
    when: daysFromNow(4),
    tags: ["보고"],
    createdAt: fmt(today),
  },
  {
    id: "t7",
    title: "운동화 세탁",
    when: daysFromNow(5),
    tags: ["집"],
    createdAt: fmt(today),
  },

  // 다음주 이후 (7일+)
  {
    id: "t8",
    title: "분기 OKR 점검",
    when: daysFromNow(10),
    tags: ["업무"],
    createdAt: fmt(today),
  },
  {
    id: "t9",
    title: "가족 여행 숙소 예약",
    star: true,
    deadline: daysFromNow(14),
    tags: ["가족", "여행"],
    createdAt: fmt(today),
  },
  {
    id: "t10",
    title: "자동차 보험 갱신",
    priority: "high",
    when: daysFromNow(20),
    tags: ["결재대기"],
    createdAt: fmt(today),
  },

  // 날짜 없음 (anytime)
  {
    id: "t11",
    title: "아침 커피콩 주문",
    tags: ["집"],
    createdAt: fmt(today),
  },
  {
    id: "t12",
    title: "독서 — 디자인의 디자인",
    star: true,
    tags: ["성장"],
    createdAt: fmt(today),
  },
  {
    id: "t13",
    title: "냉장고 정리",
    tags: ["집"],
    createdAt: fmt(today),
  },

  // someday
  {
    id: "t14",
    title: "사이드 프로젝트 아이디어 정리",
    someday: true,
    tags: ["성장"],
    createdAt: fmt(today),
  },
  {
    id: "t15",
    title: "제주도 한 달 살기 계획",
    someday: true,
    star: true,
    tags: ["여행", "가족"],
    createdAt: fmt(today),
  },

  // 완료된 항목
  {
    id: "t16",
    title: "기획안 초안 검토",
    done: true,
    doneAt: daysFromNow(-1),
    tags: ["업무"],
    createdAt: fmt(today),
  },
  {
    id: "t17",
    title: "마트 장보기",
    done: true,
    doneAt: daysFromNow(-2),
    tags: ["집"],
    createdAt: fmt(today),
  },
  {
    id: "t18",
    title: "헬스장 등록",
    done: true,
    doneAt: daysFromNow(-3),
    tags: ["건강"],
    createdAt: fmt(today),
  },
];

interface TasksState {
  tasks: TaskItem[];
  addTask: (task: Omit<TaskItem, "id" | "createdAt">) => void;
  toggleDone: (id: string) => void;
  toggleStar: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, partial: Partial<TaskItem>) => void;
}

export const useTasksStore = create<TasksState>((set) => ({
  tasks: INITIAL_TASKS,

  addTask: (task) =>
    set((s) => ({
      tasks: [
        ...s.tasks,
        {
          ...task,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  toggleDone: (id) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id
          ? { ...t, done: !t.done, doneAt: !t.done ? new Date().toISOString() : null }
          : t
      ),
    })),

  toggleStar: (id) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, star: !t.star } : t)),
    })),

  deleteTask: (id) =>
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  updateTask: (id, partial) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...partial } : t)),
    })),
}));
