import { create } from "zustand";
import type { Area } from "@/types/area";
import { INITIAL_AREAS } from "@/types/area";

interface AreasState {
  areas: Area[];
  addArea: (area: Omit<Area, "id" | "createdAt" | "order">) => void;
  updateArea: (id: string, partial: Partial<Area>) => void;
  deleteArea: (id: string) => void;
  reorderAreas: (orderedIds: string[]) => void;
  toggleHide: (id: string) => void;
}

export const useAreasStore = create<AreasState>((set) => ({
  areas: INITIAL_AREAS,

  addArea: (area) =>
    set((s) => ({
      areas: [
        ...s.areas,
        {
          ...area,
          id: crypto.randomUUID(),
          order: s.areas.length + 1,
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  updateArea: (id, partial) =>
    set((s) => ({
      areas: s.areas.map((a) => (a.id === id ? { ...a, ...partial } : a)),
    })),

  deleteArea: (id) =>
    set((s) => ({ areas: s.areas.filter((a) => a.id !== id) })),

  reorderAreas: (orderedIds) =>
    set((s) => ({
      areas: orderedIds
        .map((id, index) => {
          const area = s.areas.find((a) => a.id === id);
          return area ? { ...area, order: index + 1 } : null;
        })
        .filter((a): a is Area => a !== null),
    })),

  toggleHide: (id) =>
    set((s) => ({
      areas: s.areas.map((a) =>
        a.id === id ? { ...a, hidden: !a.hidden } : a
      ),
    })),
}));
