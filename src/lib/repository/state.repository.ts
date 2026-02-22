// src/lib/repository/state.repository.ts
import { LocalStorageRepository } from "./localStorage.repository";
import { MongoRepository, type PersistedState } from "./mongo.repository";

export class StateRepository {
  private local = new LocalStorageRepository();
  private mongo = new MongoRepository();

  async load(): Promise<PersistedState | null> {
    // 1) tente Mongo
    try {
      const remote = await this.mongo.load();
      if (remote) return remote;
    } catch {
      // ignore: fallback local
    }

    // 2) fallback local
    return this.local.load();
  }

  async save(data: PersistedState): Promise<void> {
    // 1) tente Mongo d'abord
    try {
      await this.mongo.save(data);
      return;
    } catch {
      // fallback local en dernier recours
      this.local.save(data);
    }
  }

  clearLocalBackup() {
    this.local.clear?.();
  }
}

export const stateRepository = new StateRepository();
