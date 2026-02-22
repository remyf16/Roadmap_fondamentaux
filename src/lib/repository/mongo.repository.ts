// src/lib/repository/mongo.repository.ts
export type PersistedState = unknown; // tu peux typer ensuite (tasks/teams/...)

export class MongoRepository {
  async load(): Promise<PersistedState | null> {
    const res = await fetch("/api/state");
    if (!res.ok) throw new Error(`GET /api/state failed: ${res.status}`);
    return (await res.json()) as PersistedState | null;
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
