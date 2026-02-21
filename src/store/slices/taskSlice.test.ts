import { describe, it, expect, beforeEach } from "vitest";
import { create } from "zustand";
import { createTaskSlice, type TaskSlice } from "./taskSlice";

function createTestStore() {
  return create<TaskSlice>()((...args) => createTaskSlice(...args));
}

describe("taskSlice", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it("should initialize with empty tasks", () => {
    expect(store.getState().tasks).toEqual([]);
  });

  it("should set tasks", () => {
    const tasks = [
      {
        id: "1",
        title: "Task 1",
        status: "todo" as const,
        teamId: "t1",
        sprintId: "s1",
        startDate: "2025-01-01",
        endDate: "2025-01-07",
        progress: 0,
        order: 0,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
    ];
    store.getState().setTasks(tasks);
    expect(store.getState().tasks).toEqual(tasks);
  });

  it("should add a task with generated id and timestamps", () => {
    store.getState().addTask({
      title: "New Task",
      status: "backlog",
      teamId: "t1",
      sprintId: "s1",
      startDate: "2025-01-01",
      endDate: "2025-01-07",
      progress: 0,
      order: 0,
    });

    const tasks = store.getState().tasks;
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe("New Task");
    expect(tasks[0].id).toBeDefined();
    expect(tasks[0].createdAt).toBeDefined();
    expect(tasks[0].updatedAt).toBeDefined();
  });

  it("should update a task", () => {
    store.getState().setTasks([
      {
        id: "1",
        title: "Task 1",
        status: "todo",
        teamId: "t1",
        sprintId: "s1",
        startDate: "2025-01-01",
        endDate: "2025-01-07",
        progress: 0,
        order: 0,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
    ]);

    store.getState().updateTask("1", { title: "Updated Task", progress: 50 });

    const task = store.getState().tasks[0];
    expect(task.title).toBe("Updated Task");
    expect(task.progress).toBe(50);
    expect(task.updatedAt).not.toBe("2025-01-01T00:00:00Z");
  });

  it("should delete a task and its children", () => {
    store.getState().setTasks([
      {
        id: "parent",
        title: "Parent",
        status: "todo",
        teamId: "t1",
        sprintId: "s1",
        startDate: "2025-01-01",
        endDate: "2025-01-07",
        progress: 0,
        order: 0,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
      {
        id: "child",
        title: "Child",
        status: "todo",
        teamId: "t1",
        sprintId: "s1",
        startDate: "2025-01-01",
        endDate: "2025-01-07",
        progress: 0,
        order: 1,
        parentTaskId: "parent",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
    ]);

    store.getState().deleteTask("parent");
    expect(store.getState().tasks).toHaveLength(0);
  });

  it("should move a task to a new status and order", () => {
    store.getState().setTasks([
      {
        id: "1",
        title: "Task 1",
        status: "todo",
        teamId: "t1",
        sprintId: "s1",
        startDate: "2025-01-01",
        endDate: "2025-01-07",
        progress: 0,
        order: 0,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
    ]);

    store.getState().moveTask("1", "in_progress", 5);

    const task = store.getState().tasks[0];
    expect(task.status).toBe("in_progress");
    expect(task.order).toBe(5);
  });
});
