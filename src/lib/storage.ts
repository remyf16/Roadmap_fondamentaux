// src/lib/storage.ts
import type { IDataRepository } from "./repository/types";
import { MongoRepository } from "./repository/mongo.repository";

export function createRepository(): IDataRepository {
  return new MongoRepository();
}
