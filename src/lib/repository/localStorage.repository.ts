import type { AppData } from "@/types/appData"; // adapte si besoin

const STORAGE_KEY = "roadmap-app-data";

export class LocalStorageRepository {
  async load(): Promise<AppData | null> {
    if (typeof window === "undefined") return null;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AppData;
    } catch {
      return null;
    }
  }

  async save(data: AppData): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}
