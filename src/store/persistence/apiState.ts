// src/store/persistence/apiState.ts
import type { AppStore } from "@/store";

// ⚠️ On ne sauvegarde PAS tout le store (actions/fonctions),
// uniquement les données "persistables".
export type PersistedState = Pick<
  AppStore,
  | "tasks"
  | "teams"
  | "sprints"
  | "dependencies"
  | "milestones"
  | "topics"
  // si tu veux persister aussi des préférences UI, ajoute-les ici :
  // | "filters" | "groupByLevels" | "zoomLevel"
>;

export async function fetchState(): Promise<PersistedState | null> {
  const res = await fetch("/api/state", { method: "GET" });
  if (!res.ok) throw new Error(`GET /api/state failed: ${res.status}`);
  return (await res.json()) as PersistedState | null;
}

export async function saveState(state: PersistedState): Promise<void> {
  const res = await fetch("/api/state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  });
  if (!res.ok) throw new Error(`POST /api/state failed: ${res.status}`);
}
