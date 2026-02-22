// src/store/persistence/sync.ts
import { useAppStore, type AppStore } from "@/store";
import { stateRepository } from "@/lib/repository/state.repository";
import type { AppData } from "@/types/models";

// Incrémente si tu changes le schéma (utile pour futures migrations)
const APP_DATA_VERSION = 1;

// sélectionne uniquement les données (pas les actions)
function selectPersistedState(s: AppStore): AppData {
  return {
    tasks: s.tasks,
    teams: s.teams,
    sprints: s.sprints,
    dependencies: s.dependencies,
    milestones: s.milestones,
    topics: s.topics,
    version: APP_DATA_VERSION,
  };
}

let started = false;

export async function hydrateStore() {
  const data = await stateRepository.load();
  if (!data) return;

  // sécurise les anciens états sans "version"
  const safe = {
    ...(data as Partial<AppData>),
    version:
      typeof (data as Partial<AppData>)?.version === "number"
        ? (data as Partial<AppData>).version!
        : APP_DATA_VERSION,
  } as AppData;

  useAppStore.setState((current) => ({
    ...current,
    // on ne merge que les champs persistés
    tasks: safe.tasks ?? current.tasks,
    teams: safe.teams ?? current.teams,
    sprints: safe.sprints ?? current.sprints,
    dependencies: safe.dependencies ?? current.dependencies,
    milestones: safe.milestones ?? current.milestones,
    topics: safe.topics ?? current.topics,
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
