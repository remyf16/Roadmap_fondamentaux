import type { StateCreator } from "zustand";
import type { Topic, ID } from "@/types/models";

const TOPIC_COLORS = [
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#EF4444", // red
  "#F97316", // orange
  "#EAB308", // yellow
  "#22C55E", // green
  "#14B8A6", // teal
  "#06B6D4", // cyan
  "#6366F1", // indigo
];

export function getNextColor(existingTopics: Topic[]): string {
  const index = existingTopics.length % TOPIC_COLORS.length;
  return TOPIC_COLORS[index];
}

export interface TopicSlice {
  topics: Topic[];
  setTopics: (topics: Topic[]) => void;
  addTopic: (name: string) => Topic;
  updateTopic: (id: ID, updates: Partial<Omit<Topic, "id">>) => void;
  deleteTopic: (id: ID) => void;
}

export const createTopicSlice: StateCreator<TopicSlice, [], [], TopicSlice> = (
  set,
  get,
) => ({
  topics: [],
  setTopics: (topics) => set({ topics }),
  addTopic: (name) => {
    const newTopic: Topic = {
      id: crypto.randomUUID(),
      name,
      color: getNextColor(get().topics),
    };
    set((state) => ({ topics: [...state.topics, newTopic] }));
    return newTopic;
  },
  updateTopic: (id, updates) =>
    set((state) => ({
      topics: state.topics.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTopic: (id) =>
    set((state) => ({
      topics: state.topics.filter((t) => t.id !== id),
    })),
});
