// src/store/persistence/sync.ts
import { useAppStore, type AppStore } from "@/store";
import { stateRepository } from "@/lib/repository/state.repository";

// sélectionne uniquement les données (pas les actions)
function selectPersistedState(s: AppStore) {
  return {
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

  useAppStore.setState((current) => ({
    ...current,
    ...(data as any),
  }));
}

export function startAutosave() {
  if (started) return;
  started = true;

  let timer: any = null;
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
    }
  );
}
