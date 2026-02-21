import type { StateCreator } from "zustand";
import type { Dependency, DependencyType, ID } from "@/types/models";

export interface DependencySlice {
  dependencies: Dependency[];
  setDependencies: (deps: Dependency[]) => void;
  addDependency: (
    sourceTaskId: ID,
    targetTaskId: ID,
    type: DependencyType,
  ) => void;
  removeDependency: (sourceTaskId: ID, targetTaskId: ID) => void;
}

export const createDependencySlice: StateCreator<
  DependencySlice,
  [],
  [],
  DependencySlice
> = (set) => ({
  dependencies: [],
  setDependencies: (dependencies) => set({ dependencies }),
  addDependency: (sourceTaskId, targetTaskId, type) =>
    set((state) => ({
      dependencies: [
        ...state.dependencies,
        { sourceTaskId, targetTaskId, type },
      ],
    })),
  removeDependency: (sourceTaskId, targetTaskId) =>
    set((state) => ({
      dependencies: state.dependencies.filter(
        (d) =>
          !(d.sourceTaskId === sourceTaskId && d.targetTaskId === targetTaskId),
      ),
    })),
});
