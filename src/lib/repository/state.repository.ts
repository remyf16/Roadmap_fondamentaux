// src/lib/repository/state.repository.ts
import { MongoRepository, type PersistedState } from "./mongo.repository";

export class StateRepository {
  private mongo = new MongoRepository();

  async load(): Promise<PersistedState | null> {
    return this.mongo.load();
  }

  async save(data: PersistedState): Promise<void> {
    await this.mongo.save(data);
  }
}

export const stateRepository = new StateRepository();
