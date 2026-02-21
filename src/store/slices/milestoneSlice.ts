import type { StateCreator } from "zustand";
import type { Milestone, ID } from "@/types/models";

export interface MilestoneSlice {
  milestones: Milestone[];
  setMilestones: (milestones: Milestone[]) => void;
  addMilestone: (milestone: Omit<Milestone, "id">) => void;
  updateMilestone: (id: ID, milestone: Partial<Omit<Milestone, "id">>) => void;
  deleteMilestone: (id: ID) => void;
}

export const createMilestoneSlice: StateCreator<
  MilestoneSlice,
  [],
  [],
  MilestoneSlice
> = (set) => ({
  milestones: [],
  setMilestones: (milestones) => set({ milestones }),
  addMilestone: (milestone) =>
    set((state) => ({
      milestones: [
        ...state.milestones,
        { ...milestone, id: `ms-${Date.now()}` },
      ],
    })),
  updateMilestone: (id, milestoneUpdate) =>
    set((state) => ({
      milestones: state.milestones.map((ms) =>
        ms.id === id ? { ...ms, ...milestoneUpdate } : ms
      ),
    })),
  deleteMilestone: (id) =>
    set((state) => ({
      milestones: state.milestones.filter((ms) => ms.id !== id),
    })),
});
