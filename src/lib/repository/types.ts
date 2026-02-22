// src/lib/repository/types.ts
import type { AppData } from "@/types/models";

export type PersistedState = AppData;

export interface IDataRepository<T = AppData> {
  load(): Promise<T | null>;
  save(data: T): Promise<void>;
  clear(): Promise<void>;
}
