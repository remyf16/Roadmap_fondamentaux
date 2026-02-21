import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useGroupedTasks, ROLE_LABELS } from "./useGroupedTasks";
import type { Task, Topic } from "@/types/models";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    title: "Test task",
    status: "todo",
    teamId: "team-1",
    startDate: "2025-01-15",
    endDate: "2025-01-30",
    progress: 0,
    order: 0,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
    ...overrides,
  };
}

const topics: Topic[] = [
  { id: "topic-a", name: "Backend", color: "#3B82F6" },
  { id: "topic-b", name: "Analytics", color: "#8B5CF6" },
  { id: "topic-c", name: "Design", color: "#EC4899" },
];

describe("useGroupedTasks", () => {
  describe("no levels (empty array)", () => {
    it("should return flat task rows with depth 0", () => {
      const tasks = [makeTask(), makeTask()];
      const { result } = renderHook(() => useGroupedTasks(tasks, []));

      expect(result.current).toHaveLength(2);
      expect(result.current.every((r) => r.type === "task")).toBe(true);
      expect(result.current.every((r) => r.depth === 0)).toBe(true);
    });

    it("should return empty array for no tasks", () => {
      const { result } = renderHook(() => useGroupedTasks([], []));
      expect(result.current).toHaveLength(0);
    });
  });

  describe("single level: topic", () => {
    it("should group tasks by topic with headers at depth 0 and tasks at depth 1", () => {
      const tasks = [
        makeTask({ topicIds: ["topic-c"] }),
        makeTask({ topicIds: ["topic-a"] }),
        makeTask({ topicIds: ["topic-b"] }),
      ];
      const { result } = renderHook(() =>
        useGroupedTasks(tasks, ["topic"], topics),
      );

      const headers = result.current.filter((r) => r.type === "header");
      expect(headers).toHaveLength(3);
      expect(headers[0].group!.label).toBe("Analytics");
      expect(headers[1].group!.label).toBe("Backend");
      expect(headers[2].group!.label).toBe("Design");
      expect(headers.every((h) => h.depth === 0)).toBe(true);

      const taskRows = result.current.filter((r) => r.type === "task");
      expect(taskRows).toHaveLength(3);
      expect(taskRows.every((t) => t.depth === 1)).toBe(true);
    });

    it("should put tasks without topic in 'Sans thème' group at the end", () => {
      const tasks = [
        makeTask({ topicIds: ["topic-a"] }),
        makeTask({ topicIds: undefined }),
        makeTask({ topicIds: [] }),
      ];
      const { result } = renderHook(() =>
        useGroupedTasks(tasks, ["topic"], topics),
      );

      const headers = result.current.filter((r) => r.type === "header");
      expect(headers).toHaveLength(2);
      expect(headers[0].group!.label).toBe("Backend");
      expect(headers[1].group!.label).toBe("Sans thème");
    });

    it("should include topic color in group", () => {
      const tasks = [makeTask({ topicIds: ["topic-b"] })];
      const { result } = renderHook(() =>
        useGroupedTasks(tasks, ["topic"], topics),
      );

      const header = result.current.find((r) => r.type === "header");
      expect(header!.group!.color).toBe("#8B5CF6");
    });
  });

  describe("single level: role", () => {
    it("should group tasks by role sorted by ROLE_ORDER", () => {
      const tasks = [
        makeTask({ roles: ["developer"] }),
        makeTask({ roles: ["product_owner"] }),
        makeTask({ roles: ["product_designer"] }),
      ];
      const { result } = renderHook(() => useGroupedTasks(tasks, ["role"]));

      const headers = result.current.filter((r) => r.type === "header");
      expect(headers).toHaveLength(3);
      expect(headers[0].group!.label).toBe("Product Owner");
      expect(headers[1].group!.label).toBe("Product Designer");
      expect(headers[2].group!.label).toBe("Développeur");
    });

    it("should put tasks without role in 'Sans métier' at the end", () => {
      const tasks = [
        makeTask({ roles: ["developer"] }),
        makeTask({ roles: undefined }),
      ];
      const { result } = renderHook(() => useGroupedTasks(tasks, ["role"]));

      const headers = result.current.filter((r) => r.type === "header");
      expect(headers[headers.length - 1].group!.label).toBe("Sans métier");
    });
  });

  describe("single level: month", () => {
    it("should group tasks by start month sorted chronologically", () => {
      const tasks = [
        makeTask({ startDate: "2025-03-10" }),
        makeTask({ startDate: "2025-01-05" }),
        makeTask({ startDate: "2025-01-20" }),
        makeTask({ startDate: "2025-02-15" }),
      ];
      const { result } = renderHook(() => useGroupedTasks(tasks, ["month"]));

      const headers = result.current.filter((r) => r.type === "header");
      expect(headers).toHaveLength(3);
      expect(headers[0].group!.label).toBe("Janvier 2025");
      expect(headers[1].group!.label).toBe("Février 2025");
      expect(headers[2].group!.label).toBe("Mars 2025");
    });
  });

  describe("multi-level: topic + role", () => {
    it("should produce nested headers with increasing depth", () => {
      const tasks = [
        makeTask({ topicIds: ["topic-a"], roles: ["developer"] }),
        makeTask({ topicIds: ["topic-a"], roles: ["product_owner"] }),
        makeTask({ topicIds: ["topic-b"], roles: ["developer"] }),
      ];
      const { result } = renderHook(() =>
        useGroupedTasks(tasks, ["topic", "role"], topics),
      );

      // Level 0 headers: Analytics, Backend
      const level0Headers = result.current.filter(
        (r) => r.type === "header" && r.depth === 0,
      );
      expect(level0Headers).toHaveLength(2);
      expect(level0Headers[0].group!.label).toBe("Analytics");
      expect(level0Headers[1].group!.label).toBe("Backend");

      // Level 1 headers (sub-groups by role)
      const level1Headers = result.current.filter(
        (r) => r.type === "header" && r.depth === 1,
      );
      expect(level1Headers.length).toBeGreaterThanOrEqual(2);

      // Tasks at depth 2
      const taskRows = result.current.filter((r) => r.type === "task");
      expect(taskRows).toHaveLength(3);
      expect(taskRows.every((t) => t.depth === 2)).toBe(true);
    });

    it("should correctly structure: header(0) > header(1) > tasks(2)", () => {
      const tasks = [
        makeTask({ topicIds: ["topic-a"], roles: ["developer"] }),
      ];
      const { result } = renderHook(() =>
        useGroupedTasks(tasks, ["topic", "role"], topics),
      );

      expect(result.current).toHaveLength(3);
      expect(result.current[0]).toMatchObject({ type: "header", depth: 0 });
      expect(result.current[1]).toMatchObject({ type: "header", depth: 1 });
      expect(result.current[2]).toMatchObject({ type: "task", depth: 2 });
    });
  });

  describe("ROLE_LABELS", () => {
    it("should have a label for every role", () => {
      expect(Object.keys(ROLE_LABELS)).toHaveLength(7);
      expect(ROLE_LABELS.developer).toBe("Développeur");
      expect(ROLE_LABELS.product_marketing_manager).toBe("PMM");
    });
  });
});
