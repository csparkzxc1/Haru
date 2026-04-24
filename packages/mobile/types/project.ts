import type { Project as SharedProject } from "@haru/shared";

export type Project = SharedProject;

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "project_finance",
    name: "재테크 관리",
    areaId: "area_personal",
    emoji: "💰",
    when: null,
    deadline: null,
    doneAt: null,
    order: 1,
    createdAt: "2026-04-24T00:00:00.000Z",
  },
  {
    id: "project_goals_2026",
    name: "2026 목표",
    areaId: "area_personal",
    emoji: "🎯",
    when: null,
    deadline: "2026-12-31T23:59:59.999Z",
    doneAt: null,
    order: 2,
    createdAt: "2026-04-24T00:00:00.000Z",
  },
];
