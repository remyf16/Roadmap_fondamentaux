import { describe, it, expect, beforeEach } from "vitest";
import { create } from "zustand";
import { createUiSlice, type UiSlice } from "./uiSlice";

function createTestStore() {
  return create<UiSlice>()((...args) => createUiSlice(...args));
}

describe("uiSlice", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it("should initialize with default filters containing empty roles array", () => {
    const filters = store.getState().filters;
    expect(filters.roles).toEqual([]);
  });

  it("should update filters.roles when setFilter is called", () => {
    store.getState().setFilter("roles", ["product_owner", "developer"]);
    expect(store.getState().filters.roles).toEqual([
      "product_owner",
      "developer",
    ]);
  });

  it("should reset filters.roles to empty array when resetFilters is called", () => {
    // Set some roles
    store
      .getState()
      .setFilter("roles", ["product_manager", "product_designer"]);
    expect(store.getState().filters.roles).toHaveLength(2);

    // Reset filters
    store.getState().resetFilters();
    expect(store.getState().filters.roles).toEqual([]);
  });

  it("should initialize with default filters containing empty topicIds array", () => {
    const filters = store.getState().filters;
    expect(filters.topicIds).toEqual([]);
  });

  it("should update filters.topicIds when setFilter is called", () => {
    store.getState().setFilter("topicIds", ["topic-1", "topic-2"]);
    expect(store.getState().filters.topicIds).toEqual(["topic-1", "topic-2"]);
  });

  it("should reset filters.topicIds to empty array when resetFilters is called", () => {
    store.getState().setFilter("topicIds", ["topic-1"]);
    expect(store.getState().filters.topicIds).toHaveLength(1);

    store.getState().resetFilters();
    expect(store.getState().filters.topicIds).toEqual([]);
  });

  it("should initialize groupByLevels to empty array", () => {
    expect(store.getState().groupByLevels).toEqual([]);
  });

  it("should add a level when toggleGroupByLevel is called", () => {
    store.getState().toggleGroupByLevel("topic");
    expect(store.getState().groupByLevels).toEqual(["topic"]);

    store.getState().toggleGroupByLevel("role");
    expect(store.getState().groupByLevels).toEqual(["topic", "role"]);
  });

  it("should remove a level when toggleGroupByLevel is called with existing level", () => {
    store.getState().toggleGroupByLevel("topic");
    store.getState().toggleGroupByLevel("role");
    store.getState().toggleGroupByLevel("topic");
    expect(store.getState().groupByLevels).toEqual(["role"]);
  });

  it("should clear all levels when clearGroupBy is called", () => {
    store.getState().toggleGroupByLevel("topic");
    store.getState().toggleGroupByLevel("month");
    store.getState().clearGroupBy();
    expect(store.getState().groupByLevels).toEqual([]);
  });

  it("should reset groupByLevels to empty array when resetFilters is called", () => {
    store.getState().toggleGroupByLevel("topic");
    expect(store.getState().groupByLevels).toHaveLength(1);

    store.getState().resetFilters();
    expect(store.getState().groupByLevels).toEqual([]);
  });
});
