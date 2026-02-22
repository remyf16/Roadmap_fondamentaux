// src/lib/repository/types.ts
import type { AppData } from "@/types/models";

export interface IDataRepository {
  load(): Promise<AppData | null>;
  save(data: AppData): Promise<void>;
}
