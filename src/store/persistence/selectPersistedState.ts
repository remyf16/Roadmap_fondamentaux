// src/store/persistence/selectPersistedState.ts
import type { AppStore } from "@/store";
import type { PersistedState } from "./apiState";

export function selectPersistedState(s: AppStore): PersistedState {
  return {
    tasks: s.tasks,
    teams: s.teams,
    sprints: s.sprints,
    dependencies: s.dependencies,
    milestones: s.milestones,
    topics: s.topics,
  };
}
