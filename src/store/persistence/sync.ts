// src/store/persistence/sync.ts
import { useAppStore, type AppStore } from "@/store";
import { stateRepository } from "@/lib/repository/state.repository";
import type { AppData } from "@/types/models";

const APP_DATA_VERSION = 1;

// sélectionne uniquement les données persistées
function selectPersistedState(s: AppStore): AppData {
  return {
    version: APP_DATA_VERSION,
    tasks: s.tasks,
    teams: s.teams,
    sprints: s.sprints,
    dependencies: s.dependencies,
    milestones: s.milestones,
    topics: s.topics,
  };
}

let started = false;

export async function hydrateStore() {
  const data = await stateRepository.load();
  if (!data) return;

  // hydrate uniquement les clés persistées
  useAppStore.setState((current) => ({
    ...current,
    tasks: data.tasks ?? current.tasks,
    teams: data.teams ?? current.teams,
    sprints: data.sprints ?? current.sprints,
    dependencies: data.dependencies ?? current.dependencies,
    milestones: data.milestones ?? current.milestones,
    topics: data.topics ?? current.topics,
  }));
}

export function startAutosave() {
  if (started) return;
  started = true;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let last = JSON.stringify(selectPersistedState(useAppStore.getState()));

  useAppStore.subscribe(
    (s) => selectPersistedState(s),
    (next) => {
      const nextStr = JSON.stringify(next);
      if (nextStr === last) return;
      last = nextStr;

      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          await stateRepository.save(next);
        } catch (e) {
          console.error("save failed", e);
        }
      }, 800);
    },
  );
}
