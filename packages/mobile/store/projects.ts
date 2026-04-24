import { create } from "zustand";
import type { Project } from "@/types/project";
import { INITIAL_PROJECTS } from "@/types/project";

interface ProjectsState {
  projects: Project[];
  addProject: (project: Omit<Project, "id" | "createdAt" | "order">) => void;
  updateProject: (id: string, partial: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  reorderProjects: (orderedIds: string[]) => void;
  toggleDone: (id: string) => void;
  getProjectsByArea: (areaId: string | null) => Project[];
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: INITIAL_PROJECTS,

  addProject: (project) =>
    set((s) => {
      const areaProjects = s.projects.filter(
        (p) => p.areaId === project.areaId
      );
      return {
        projects: [
          ...s.projects,
          {
            ...project,
            id: crypto.randomUUID(),
            order: areaProjects.length + 1,
            createdAt: new Date().toISOString(),
          },
        ],
      };
    }),

  updateProject: (id, partial) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...partial } : p)),
    })),

  deleteProject: (id) =>
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

  reorderProjects: (orderedIds) =>
    set((s) => ({
      projects: orderedIds
        .map((id, index) => {
          const project = s.projects.find((p) => p.id === id);
          return project ? { ...project, order: index + 1 } : null;
        })
        .filter((p): p is Project => p !== null),
    })),

  toggleDone: (id) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id
          ? { ...p, done: !p.done, doneAt: !p.done ? new Date().toISOString() : null }
          : p
      ),
    })),

  getProjectsByArea: (areaId) =>
    get().projects.filter((p) => p.areaId === areaId),
}));
