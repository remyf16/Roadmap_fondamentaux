import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { Task, Topic, GroupByType, Role } from "@/types/models";

export interface TaskGroup {
  key: string;
  label: string;
  color?: string;
  tasks: Task[];
}

/** A flat row representing either a group header or a task, with depth info */
export interface GroupedRow {
  type: "header" | "task";
  depth: number;
  group?: TaskGroup;
  task?: Task;
}

export const ROLE_LABELS: Record<Role, string> = {
  product_owner: "Product Owner",
  product_manager: "Product Manager",
  product_designer: "Product Designer",
  product_marketing_manager: "PMM",
  direction: "Direction",
  e_learning: "E-learning",
  developer: "Développeur",
};

const ROLE_ORDER: Role[] = [
  "product_owner",
  "product_manager",
  "product_designer",
  "product_marketing_manager",
  "direction",
  "e_learning",
  "developer",
];

function groupByTopic(tasks: Task[], topics: Topic[]): TaskGroup[] {
  const topicMap = new Map(topics.map((t) => [t.id, t]));
  const groups = new Map<string, TaskGroup>();

  for (const task of tasks) {
    const topicId = task.topicIds?.[0];
    const topic = topicId ? topicMap.get(topicId) : undefined;
    const key = topic ? topic.id : "__none_topic__";

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: topic ? topic.name : "Sans thème",
        color: topic?.color,
        tasks: [],
      });
    }
    groups.get(key)!.tasks.push(task);
  }

  return [...groups.values()].sort((a, b) => {
    if (a.key === "__none_topic__") return 1;
    if (b.key === "__none_topic__") return -1;
    return a.label.localeCompare(b.label, "fr");
  });
}

function groupByRole(tasks: Task[]): TaskGroup[] {
  const groups = new Map<string, TaskGroup>();

  for (const task of tasks) {
    const role = task.roles?.[0];
    const key = role ?? "__none_role__";

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: role ? ROLE_LABELS[role] : "Sans métier",
        tasks: [],
      });
    }
    groups.get(key)!.tasks.push(task);
  }

  return [...groups.values()].sort((a, b) => {
    if (a.key === "__none_role__") return 1;
    if (b.key === "__none_role__") return -1;
    return ROLE_ORDER.indexOf(a.key as Role) - ROLE_ORDER.indexOf(b.key as Role);
  });
}

function groupByMonth(tasks: Task[]): TaskGroup[] {
  const groups = new Map<string, TaskGroup>();

  for (const task of tasks) {
    const date = parseISO(task.startDate);
    const key = format(date, "yyyy-MM");
    const label = format(date, "MMMM yyyy", { locale: fr });

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: label.charAt(0).toUpperCase() + label.slice(1),
        tasks: [],
      });
    }
    groups.get(key)!.tasks.push(task);
  }

  return [...groups.values()].sort((a, b) => a.key.localeCompare(b.key));
}

function applyGrouping(
  tasks: Task[],
  level: GroupByType,
  topics: Topic[],
): TaskGroup[] {
  if (level === "topic") return groupByTopic(tasks, topics);
  if (level === "role") return groupByRole(tasks);
  if (level === "month") return groupByMonth(tasks);
  return [{ key: "all", label: "Toutes les tâches", tasks }];
}

/**
 * Recursively flatten groups into rows with depth info.
 * For each level, groups the tasks, emits a header row, then either
 * recurses into sub-levels or emits task rows.
 */
function flattenGroups(
  tasks: Task[],
  levels: GroupByType[],
  topics: Topic[],
  depth: number,
): GroupedRow[] {
  if (levels.length === 0) {
    return tasks.map((task) => ({ type: "task" as const, depth, task }));
  }

  const [currentLevel, ...remainingLevels] = levels;
  const groups = applyGrouping(tasks, currentLevel, topics);
  const rows: GroupedRow[] = [];

  for (const group of groups) {
    rows.push({ type: "header", depth, group });
    rows.push(...flattenGroups(group.tasks, remainingLevels, topics, depth + 1));
  }

  return rows;
}

export function useGroupedTasks(
  tasks: Task[],
  levels: GroupByType[],
  topics: Topic[] = [],
): GroupedRow[] {
  return useMemo(() => {
    if (levels.length === 0) {
      return tasks.map((task) => ({ type: "task" as const, depth: 0, task }));
    }
    return flattenGroups(tasks, levels, topics, 0);
  }, [tasks, levels, topics]);
}
