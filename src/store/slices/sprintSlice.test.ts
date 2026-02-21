import { describe, it, expect, beforeEach } from "vitest";
import { create } from "zustand";
import { createSprintSlice, type SprintSlice } from "./sprintSlice";

function createTestStore() {
  return create<SprintSlice>()((...args) => createSprintSlice(...args));
}

const baseSprint = {
  name: "Sprint 1",
  number: 1,
  startDate: "2026-01-06",
  endDate: "2026-01-17",
  weekRange: "S2-S3",
};

describe("sprintSlice", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it("should initialize with empty sprints", () => {
    expect(store.getState().sprints).toEqual([]);
  });

  it("should set sprints", () => {
    const sprints = [
      { id: "s1", ...baseSprint },
      { id: "s2", ...baseSprint, name: "Sprint 2", number: 2 },
    ];
    store.getState().setSprints(sprints);
    expect(store.getState().sprints).toEqual(sprints);
  });

  it("should add a sprint with generated id and return it", () => {
    const sprint = store.getState().addSprint(baseSprint);

    const sprints = store.getState().sprints;
    expect(sprints).toHaveLength(1);
    expect(sprints[0].name).toBe("Sprint 1");
    expect(sprints[0].number).toBe(1);
    expect(sprints[0].startDate).toBe("2026-01-06");
    expect(sprints[0].endDate).toBe("2026-01-17");
    expect(sprints[0].weekRange).toBe("S2-S3");
    expect(sprints[0].id).toBeDefined();
    expect(sprint).toEqual(sprints[0]);
  });

  it("should update a sprint by id", () => {
    store.getState().setSprints([{ id: "s1", ...baseSprint }]);

    store.getState().updateSprint("s1", { name: "Sprint 1 bis", number: 10 });

    const sprint = store.getState().sprints[0];
    expect(sprint.name).toBe("Sprint 1 bis");
    expect(sprint.number).toBe(10);
    expect(sprint.id).toBe("s1");
    expect(sprint.startDate).toBe("2026-01-06");
  });

  it("should not modify other sprints when updating", () => {
    store.getState().setSprints([
      { id: "s1", ...baseSprint },
      { id: "s2", ...baseSprint, name: "Sprint 2", number: 2 },
    ]);

    store.getState().updateSprint("s1", { name: "Updated" });

    expect(store.getState().sprints[0].name).toBe("Updated");
    expect(store.getState().sprints[1].name).toBe("Sprint 2");
  });

  it("should delete a sprint by id", () => {
    store.getState().setSprints([
      { id: "s1", ...baseSprint },
      { id: "s2", ...baseSprint, name: "Sprint 2", number: 2 },
    ]);

    store.getState().deleteSprint("s1");

    const sprints = store.getState().sprints;
    expect(sprints).toHaveLength(1);
    expect(sprints[0].id).toBe("s2");
  });

  it("should handle delete of non-existent id gracefully", () => {
    store.getState().setSprints([{ id: "s1", ...baseSprint }]);

    store.getState().deleteSprint("non-existent");

    expect(store.getState().sprints).toHaveLength(1);
  });
});
