import type { IDataRepository } from "./repository/types";
import { LocalStorageRepository } from "./repository/localStorage.repository";

export function createRepository(): IDataRepository {
  return new LocalStorageRepository();
}
