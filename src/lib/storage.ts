// src/lib/storage.ts
import type { AppData } from "@/types/models";
import type { IDataRepository } from "./repository/types";
import { LocalStorageRepository } from "./repository/localStorage.repository";

export function createRepository(): IDataRepository<AppData> {
  return new LocalStorageRepository();
}
