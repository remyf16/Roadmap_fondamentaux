const STORAGE_KEY = "roadmap-app-data";

// Type générique (à resserrer plus tard quand tu auras un vrai AppData exporté)
type AppData = Record<string, unknown>;

export class LocalStorageRepository {
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
