// src/lib/repository/mongo.repository.ts
import type { AppData } from "@/types/models";

export type PersistedState = AppData;

export class MongoRepository {
  async load(): Promise<PersistedState | null> {
    const res = await fetch("/api/state", { method: "GET" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GET /api/state failed: ${res.status}`);
    return (await res.json()) as PersistedState;
  }

  async save(data: PersistedState): Promise<void> {
    const res = await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`POST /api/state failed: ${res.status}`);
  }
}
