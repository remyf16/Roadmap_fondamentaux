// src/lib/repository/state.repository.ts
import { LocalStorageRepository } from "./localStorage.repository";
import { MongoRepository } from "./mongo.repository";
import type { PersistedState } from "./types";

export class StateRepository {
  private local = new LocalStorageRepository();
  private mongo = new MongoRepository();

  async load(): Promise<PersistedState | null> {
    try {
      const remote = await this.mongo.load();
      if (remote) return remote;
    } catch {
      // ignore -> fallback local
    }

    return this.local.load();
  }

  async save(data: PersistedState): Promise<void> {
    try {
      await this.mongo.save(data);
      return;
    } catch {
      // fallback local
      await this.local.save(data);
    }
  }

  async clearLocalBackup(): Promise<void> {
    await this.local.clear();
  }
}

export const stateRepository = new StateRepository();
