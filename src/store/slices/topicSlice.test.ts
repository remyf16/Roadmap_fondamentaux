import { describe, it, expect, beforeEach } from "vitest";
import { create } from "zustand";
import { createTopicSlice, getNextColor, type TopicSlice } from "./topicSlice";

function createTestStore() {
  return create<TopicSlice>()((...args) => createTopicSlice(...args));
}

describe("topicSlice", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it("should initialize with empty topics", () => {
    expect(store.getState().topics).toEqual([]);
  });

  it("should set topics", () => {
    const topics = [
      { id: "1", name: "Performance", color: "#3B82F6" },
      { id: "2", name: "UX", color: "#8B5CF6" },
    ];
    store.getState().setTopics(topics);
    expect(store.getState().topics).toEqual(topics);
  });

  it("should add a topic with generated id and auto color", () => {
    const topic = store.getState().addTopic("Sécurité");

    const topics = store.getState().topics;
    expect(topics).toHaveLength(1);
    expect(topics[0].name).toBe("Sécurité");
    expect(topics[0].id).toBeDefined();
    expect(topics[0].color).toBe("#3B82F6");
    expect(topic).toEqual(topics[0]);
  });

  it("should cycle colors when adding multiple topics", () => {
    store.getState().addTopic("Topic 1");
    store.getState().addTopic("Topic 2");
    store.getState().addTopic("Topic 3");

    const topics = store.getState().topics;
    expect(topics[0].color).toBe("#3B82F6");
    expect(topics[1].color).toBe("#8B5CF6");
    expect(topics[2].color).toBe("#EC4899");
  });

  it("should update a topic", () => {
    store
      .getState()
      .setTopics([{ id: "1", name: "Old Name", color: "#3B82F6" }]);

    store.getState().updateTopic("1", { name: "New Name", color: "#EF4444" });

    const topic = store.getState().topics[0];
    expect(topic.name).toBe("New Name");
    expect(topic.color).toBe("#EF4444");
    expect(topic.id).toBe("1");
  });

  it("should delete a topic", () => {
    store.getState().setTopics([
      { id: "1", name: "Topic 1", color: "#3B82F6" },
      { id: "2", name: "Topic 2", color: "#8B5CF6" },
    ]);

    store.getState().deleteTopic("1");

    const topics = store.getState().topics;
    expect(topics).toHaveLength(1);
    expect(topics[0].id).toBe("2");
  });
});

describe("getNextColor", () => {
  it("should return first color for empty list", () => {
    expect(getNextColor([])).toBe("#3B82F6");
  });

  it("should cycle through colors", () => {
    const topics = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      name: `Topic ${i}`,
      color: `#${i}`,
    }));
    expect(getNextColor(topics)).toBe("#3B82F6");
  });
});
