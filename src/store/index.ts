import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { createTaskSlice, type TaskSlice } from "./slices/taskSlice";
import { createTeamSlice, type TeamSlice } from "./slices/teamSlice";
import { createSprintSlice, type SprintSlice } from "./slices/sprintSlice";
import {
  createDependencySlice,
  type DependencySlice,
} from "./slices/dependencySlice";
import {
  createMilestoneSlice,
  type MilestoneSlice,
} from "./slices/milestoneSlice";
import { createTopicSlice, type TopicSlice } from "./slices/topicSlice";
import { createUiSlice, type UiSlice } from "./slices/uiSlice";

export type AppStore = TaskSlice &
  TeamSlice &
  SprintSlice &
  DependencySlice &
  MilestoneSlice &
  TopicSlice &
  UiSlice;

export const useAppStore = create<AppStore>()(
  devtools(
    subscribeWithSelector((...args) => ({
      ...createTaskSlice(...args),
      ...createTeamSlice(...args),
      ...createSprintSlice(...args),
      ...createDependencySlice(...args),
      ...createMilestoneSlice(...args),
      ...createTopicSlice(...args),
      ...createUiSlice(...args),
    })),
    { name: "RoadmapStore" },
  ),
);
