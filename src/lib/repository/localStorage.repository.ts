// src/lib/repository/localStorage.repository.ts
import type { AppData } from "@/types/models";
import type { IDataRepository } from "./types";

const STORAGE_KEY = "roadmap-app-data";

export class LocalStorageRepository implements IDataRepository<AppData> {
  async load(): Promise<AppData | null> {
    if (typeof window === "undefined") return null;

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AppData;
    } catch {
      return null;
    }
  }

  async save(data: AppData): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async clear(): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
