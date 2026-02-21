import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAppStore } from "@/store";
import { useFilteredTasks } from "./useFilteredTasks";
import type { Task } from "@/types/models";

describe("useFilteredTasks - role filtering", () => {
  const baseTasks: Task[] = [
    {
      id: "1",
      title: "Task 1",
      status: "todo",
      teamId: "team1",
      sprintId: "sprint1",
      startDate: "2025-01-01",
      endDate: "2025-01-07",
      progress: 0,
      order: 0,
      roles: ["product_owner", "developer"],
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    },
    {
      id: "2",
      title: "Task 2",
      status: "in_progress",
      teamId: "team1",
      sprintId: "sprint1",
      startDate: "2025-01-01",
      endDate: "2025-01-07",
      progress: 50,
      order: 1,
      roles: ["product_designer"],
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    },
    {
      id: "3",
      title: "Task 3",
      status: "done",
      teamId: "team2",
      sprintId: "sprint2",
      startDate: "2025-01-01",
      endDate: "2025-01-07",
      progress: 100,
      order: 2,
      // No roles - for backward compatibility testing
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    },
    {
      id: "4",
      title: "Task 4",
      status: "todo",
      teamId: "team1",
      sprintId: "sprint1",
      startDate: "2025-01-01",
      endDate: "2025-01-07",
      progress: 0,
      order: 3,
      roles: [],
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    },
  ];

  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      // Clear tasks first
      useAppStore.getState().setTasks([]);
      // Reset all filters
      useAppStore.getState().resetFilters();
      // Set test tasks
      useAppStore.getState().setTasks(baseTasks);
    });
  });

  it("should filter tasks by a single role", () => {
    const { result, rerender } = renderHook(() => useFilteredTasks());

    act(() => {
      useAppStore.getState().setFilter("roles", ["product_owner"]);
    });

    rerender();

    // Should include:
    // - Task 1 (has product_owner role)
    // - Task 3 (no roles - backward compatibility)
    // - Task 4 (empty roles array - backward compatibility)
    expect(result.current).toHaveLength(3);
    expect(result.current.map((t) => t.id).sort()).toEqual(["1", "3", "4"]);
  });

  it("should filter tasks by multiple roles using OR logic", () => {
    const { result, rerender } = renderHook(() => useFilteredTasks());

    act(() => {
      useAppStore
        .getState()
        .setFilter("roles", ["product_owner", "product_designer"]);
    });

    rerender();

    // Should include:
    // - Task 1 (has product_owner role)
    // - Task 2 (has product_designer role)
    // - Task 3 (no roles - backward compatibility)
    // - Task 4 (empty roles array - backward compatibility)
    expect(result.current).toHaveLength(4);
    expect(result.current.map((t) => t.id).sort()).toEqual([
      "1",
      "2",
      "3",
      "4",
    ]);
  });

  it("should not filter out tasks without roles when role filter is active", () => {
    const { result, rerender } = renderHook(() => useFilteredTasks());

    act(() => {
      useAppStore.getState().setFilter("roles", ["developer"]);
    });

    rerender();

    // Should include:
    // - Task 1 (has developer role)
    // - Task 3 (no roles - backward compatibility)
    // - Task 4 (empty roles array - backward compatibility)
    expect(result.current).toHaveLength(3);
    expect(result.current.map((t) => t.id).sort()).toEqual(["1", "3", "4"]);
  });

  it("should combine role filters with team and sprint filters", () => {
    const { result, rerender } = renderHook(() => useFilteredTasks());

    act(() => {
      useAppStore.getState().setFilter("roles", ["developer"]);
      useAppStore.getState().setFilter("teamIds", ["team1"]);
      useAppStore.getState().setFilter("sprintIds", ["sprint1"]);
    });

    rerender();

    // Should include:
    // - Task 1 (has developer role, team1, sprint1)
    // - Task 4 (empty roles array which doesn't get filtered, team1, sprint1)
    expect(result.current).toHaveLength(2);
    expect(result.current.map((t) => t.id).sort()).toEqual(["1", "4"]);
  });
});

describe("useFilteredTasks - topic filtering", () => {
  const baseTasks: Task[] = [
    {
      id: "1",
      title: "Task with topics A and B",
      status: "todo",
      teamId: "team1",
      sprintId: "sprint1",
      startDate: "2025-01-01",
      endDate: "2025-01-07",
      progress: 0,
      order: 0,
      topicIds: ["topic-a", "topic-b"],
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    },
    {
      id: "2",
      title: "Task with topic B",
      status: "in_progress",
      teamId: "team1",
      sprintId: "sprint1",
      startDate: "2025-01-01",
      endDate: "2025-01-07",
      progress: 50,
      order: 1,
      topicIds: ["topic-b"],
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    },
    {
      id: "3",
      title: "Task without topics",
      status: "done",
      teamId: "team2",
      sprintId: "sprint2",
      startDate: "2025-01-01",
      endDate: "2025-01-07",
      progress: 100,
      order: 2,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    },
    {
      id: "4",
      title: "Task with empty topics",
      status: "todo",
      teamId: "team1",
      sprintId: "sprint1",
      startDate: "2025-01-01",
      endDate: "2025-01-07",
      progress: 0,
      order: 3,
      topicIds: [],
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    },
  ];

  beforeEach(() => {
    act(() => {
      useAppStore.getState().setTasks([]);
      useAppStore.getState().resetFilters();
      useAppStore.getState().setTasks(baseTasks);
    });
  });

  it("should return all tasks when no topic filter is active", () => {
    const { result } = renderHook(() => useFilteredTasks());
    expect(result.current).toHaveLength(4);
  });

  it("should filter tasks by a single topic", () => {
    const { result, rerender } = renderHook(() => useFilteredTasks());

    act(() => {
      useAppStore.getState().setFilter("topicIds", ["topic-a"]);
    });

    rerender();

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe("1");
  });

  it("should filter tasks by multiple topics using OR logic", () => {
    const { result, rerender } = renderHook(() => useFilteredTasks());

    act(() => {
      useAppStore.getState().setFilter("topicIds", ["topic-a", "topic-b"]);
    });

    rerender();

    expect(result.current).toHaveLength(2);
    expect(result.current.map((t) => t.id).sort()).toEqual(["1", "2"]);
  });

  it("should exclude tasks without topics when topic filter is active", () => {
    const { result, rerender } = renderHook(() => useFilteredTasks());

    act(() => {
      useAppStore.getState().setFilter("topicIds", ["topic-b"]);
    });

    rerender();

    // Task 3 (no topicIds) and Task 4 (empty topicIds) are excluded
    expect(result.current).toHaveLength(2);
    expect(result.current.map((t) => t.id).sort()).toEqual(["1", "2"]);
  });
});
