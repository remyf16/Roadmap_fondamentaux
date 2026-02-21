import type { StateCreator } from "zustand";
import type { Sprint, ID } from "@/types/models";

export interface SprintSlice {
  sprints: Sprint[];
  setSprints: (sprints: Sprint[]) => void;
  addSprint: (data: Omit<Sprint, "id">) => Sprint;
  updateSprint: (id: ID, updates: Partial<Omit<Sprint, "id">>) => void;
  deleteSprint: (id: ID) => void;
}

export const createSprintSlice: StateCreator<
  SprintSlice,
  [],
  [],
  SprintSlice
> = (set) => ({
  sprints: [],
  setSprints: (sprints) => set({ sprints }),
  addSprint: (data) => {
    const newSprint: Sprint = {
      id: crypto.randomUUID(),
      ...data,
    };
    set((state) => ({ sprints: [...state.sprints, newSprint] }));
    return newSprint;
  },
  updateSprint: (id, updates) =>
    set((state) => ({
      sprints: state.sprints.map((s) =>
        s.id === id ? { ...s, ...updates } : s,
      ),
    })),
  deleteSprint: (id) =>
    set((state) => ({
      sprints: state.sprints.filter((s) => s.id !== id),
    })),
});
