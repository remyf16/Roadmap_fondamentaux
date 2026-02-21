import type { StateCreator } from "zustand";
import type { Task, Milestone, TaskStatus, ID } from "@/types/models";
import type { UiSlice } from "./uiSlice";

export interface TaskSlice {
  tasks: Task[];
  milestones: Milestone[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  createTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: ID, updates: Partial<Task>) => void;
  deleteTask: (id: ID) => void;
  moveTask: (id: ID, status: TaskStatus, order: number) => void;
  createMilestone: (milestone: Omit<Milestone, "id">) => void;
  updateMilestone: (id: ID, updates: Partial<Milestone>) => void;
  deleteMilestone: (id: ID) => void;
}

export const createTaskSlice: StateCreator<TaskSlice & UiSlice, [], [], TaskSlice> = (set) => ({
  tasks: [],
  milestones: [],
  setTasks: (tasks) => set({ tasks }),

  addTask: (taskData) =>
    set((state) => {
      const newId = crypto.randomUUID();
      const today = new Date().toISOString().split('T')[0];
      return {
        tasks: [
          ...state.tasks,
          {
            ...taskData,
            id: newId,
            startDate: taskData.startDate || today,
            endDate: taskData.endDate || today,
            description: taskData.description || "",
            roles: taskData.roles || [],
            progress: taskData.progress || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        selectedTaskId: newId,
        selectedMilestoneId: null,
      };
    }),

  createTask: (taskData) =>
    set((state) => {
      const newId = crypto.randomUUID();
      const today = new Date().toISOString().split('T')[0];
      return {
        tasks: [
          ...state.tasks,
          {
            ...taskData,
            id: newId,
            startDate: taskData.startDate || today,
            endDate: taskData.endDate || today,
            description: taskData.description || "",
            roles: taskData.roles || [],
            progress: taskData.progress || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        selectedTaskId: newId,
        selectedMilestoneId: null,
      };
    }),

  moveTask: (id, status, order) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status, order, updatedAt: new Date().toISOString() } : t
      ),
    })),

  createMilestone: (milestoneData) =>
    set((state) => {
      const newId = crypto.randomUUID();
      return {
        milestones: [
          ...state.milestones,
          {
            ...milestoneData,
            id: newId,
            date: milestoneData.date || new Date().toISOString().split('T')[0]
          },
        ],
        selectedMilestoneId: newId,
        selectedTaskId: null,
      };
    }),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
    })),

  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id && t.parentTaskId !== id) })),

  updateMilestone: (id, updates) =>
    set((state) => ({
      milestones: state.milestones.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),

  deleteMilestone: (id) =>
    set((state) => ({ milestones: state.milestones.filter((m) => m.id !== id) })),
});
