import type { Area as SharedArea, AreaColor } from "@haru/shared";

export type Area = SharedArea;
export type { AreaColor };

export const AREA_COLOR_HEX: Record<AreaColor, string> = {
  teal: "#06B6D4",
  orange: "#F97316",
  green: "#10B981",
  purple: "#8B5CF6",
  amber: "#F59E0B",
  rose: "#F43F5E",
  slate: "#64748B",
};

export const INITIAL_AREAS: Area[] = [
  {
    id: "area_personal",
    name: "개인",
    emoji: "🏠",
    color: "orange",
    order: 1,
    createdAt: "2026-04-24T00:00:00.000Z",
  },
  {
    id: "area_work",
    name: "일",
    emoji: "💼",
    color: "teal",
    order: 2,
    createdAt: "2026-04-24T00:00:00.000Z",
  },
  {
    id: "area_study",
    name: "공부",
    emoji: "📚",
    color: "purple",
    order: 3,
    createdAt: "2026-04-24T00:00:00.000Z",
  },
  {
    id: "area_hobby",
    name: "취미",
    emoji: "🌱",
    color: "green",
    order: 4,
    createdAt: "2026-04-24T00:00:00.000Z",
  },
];
