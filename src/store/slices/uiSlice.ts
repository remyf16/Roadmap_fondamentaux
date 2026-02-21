// src/store/slices/uiSlice.ts
import type { StateCreator } from "zustand";
import type { ViewType, TaskStatus, ID, Role, GroupByType } from "@/types/models";

export interface Filters {
  teamIds: ID[];
  sprintIds: ID[];
  statuses: TaskStatus[];
  searchQuery: string;
  roles: Role[];
  topicIds: ID[];
}

export interface UiSlice {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;

  selectedTaskId: ID | null;
  selectedMilestoneId: ID | null;

  detailPanelContentType: "task" | "milestone" | null;
  setDetailPanelContentType: (type: "task" | "milestone") => void;

  isDetailPanelOpen: boolean;
  openDetailPanel: (id: ID, type: "task" | "milestone") => void;
  openCreatePanel: (type: "task" | "milestone") => void;
  closeDetailPanel: () => void;

  // Zoom
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
  increaseZoom: () => void;
  decreaseZoom: () => void;

  // Filters / grouping
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  resetFilters: () => void;
  groupByLevels: GroupByType[];
  toggleGroupByLevel: (level: GroupByType) => void;
  clearGroupBy: () => void;

  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // Step modal
  isStepModalOpen: boolean;
  stepModalTaskId: ID | null;
  openStepModal: (taskId: ID) => void;
  closeStepModal: () => void;

  // --- NEW: inline steps expansion ---
  expandedTaskIds: ID[];
  toggleTaskStepsExpanded: (taskId: ID) => void;
  collapseAllTaskSteps: () => void;
}

const defaultFilters: Filters = {
  teamIds: [],
  sprintIds: [],
  statuses: [],
  searchQuery: "",
  roles: [],
  topicIds: [],
};

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set) => ({
  activeView: "timeline",
  setActiveView: (activeView) => set({ activeView }),

  selectedTaskId: null,
  selectedMilestoneId: null,

  detailPanelContentType: "task",
  isDetailPanelOpen: false,

  setDetailPanelContentType: (type) =>
    set({
      detailPanelContentType: type,
      selectedTaskId: null,
      selectedMilestoneId: null,
    }),

  openCreatePanel: (type) =>
    set({
      selectedTaskId: null,
      selectedMilestoneId: null,
      detailPanelContentType: type,
      isDetailPanelOpen: true,
    }),

  openDetailPanel: (id, type) =>
    set({
      selectedTaskId: type === "task" ? id : null,
      selectedMilestoneId: type === "milestone" ? id : null,
      detailPanelContentType: type,
      isDetailPanelOpen: true,
    }),

  closeDetailPanel: () =>
    set({
      selectedTaskId: null,
      selectedMilestoneId: null,
      detailPanelContentType: null,
      isDetailPanelOpen: false,
    }),

  // Zoom (0..6)
  zoomLevel: 2,
  setZoomLevel: (zoomLevel) => set({ zoomLevel }),
  increaseZoom: () => set((state) => ({ zoomLevel: Math.min(state.zoomLevel + 1, 6) })),
  decreaseZoom: () => set((state) => ({ zoomLevel: Math.max(state.zoomLevel - 1, 0) })),

  // Step modal
  isStepModalOpen: false,
  stepModalTaskId: null,
  openStepModal: (taskId) => set({ isStepModalOpen: true, stepModalTaskId: taskId, isDetailPanelOpen: false }),
  closeStepModal: () => set({ isStepModalOpen: false, stepModalTaskId: null }),

  // Filters
  filters: defaultFilters,
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: defaultFilters, groupByLevels: [] }),

  // Group by
  groupByLevels: [],
  toggleGroupByLevel: (level) =>
    set((state) => {
      const current = state.groupByLevels;
      if (current.includes(level)) return { groupByLevels: current.filter((l) => l !== level) };
      return { groupByLevels: [...current, level] };
    }),
  clearGroupBy: () => set({ groupByLevels: [] }),

  // Sidebar
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // --- NEW: inline steps expansion ---
  expandedTaskIds: [],
  toggleTaskStepsExpanded: (taskId) =>
    set((state) => {
      const isExpanded = state.expandedTaskIds.includes(taskId);
      return {
        expandedTaskIds: isExpanded
          ? state.expandedTaskIds.filter((id) => id !== taskId)
          : [...state.expandedTaskIds, taskId],
      };
    }),
  collapseAllTaskSteps: () => set({ expandedTaskIds: [] }),
});
