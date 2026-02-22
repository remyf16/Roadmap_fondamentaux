// src/lib/repository/mongo.repository.ts
import type { AppData } from "@/types/models";
import type { IDataRepository } from "./types";

export type PersistedState = AppData;

function withTimeout(signal: AbortSignal | undefined, ms = 10_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);

  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);

  const cleanup = () => {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", onAbort);
  };

  return { signal: controller.signal, cleanup };
}

export class MongoRepository implements IDataRepository<PersistedState> {
  async load(): Promise<PersistedState | null> {
    const { signal, cleanup } = withTimeout(undefined, 10_000);
    try {
      const res = await fetch("/api/state", { method: "GET", signal });

      if (res.status === 404) return null; // pas encore de state enregistré
      if (!res.ok) {
        throw new Error(`GET /api/state failed: ${res.status}`);
      }

      // Doit renvoyer AppData | null
      return (await res.json()) as PersistedState | null;
    } finally {
      cleanup();
    }
  }

  async save(data: PersistedState): Promise<void> {
    const { signal, cleanup } = withTimeout(undefined, 10_000);
    try {
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal,
      });

      if (!res.ok) {
        throw new Error(`POST /api/state failed: ${res.status}`);
      }
    } finally {
      cleanup();
    }
  }

  async clear(): Promise<void> {
    // Option 1 : endpoint DELETE /api/state (recommandé)
    const res = await fetch("/api/state", { method: "DELETE" });
    if (res.status === 404) return; // rien à supprimer
    if (!res.ok) throw new Error(`DELETE /api/state failed: ${res.status}`);
  }
}
