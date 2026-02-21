import type { AppData } from "@/types/models";
import type { IDataRepository } from "./types";

const STORAGE_KEY = "roadmap-app-data";

export class LocalStorageRepository implements IDataRepository {
  async load(): Promise<AppData | null> {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppData;
  }

  async save(data: AppData): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }
}
