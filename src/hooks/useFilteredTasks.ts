import { useMemo } from "react";
import { useAppStore } from "@/store";

export function useFilteredTasks() {
  const tasks = useAppStore((s) => s.tasks);
  const filters = useAppStore((s) => s.filters);

  return useMemo(() => {
    return tasks.filter((task) => {
      if (filters.teamIds.length > 0 && !filters.teamIds.includes(task.teamId))
        return false;
      if (
        filters.sprintIds.length > 0 &&
        (!task.sprintId || !filters.sprintIds.includes(task.sprintId))
      )
        return false;
      if (
        filters.statuses.length > 0 &&
        !filters.statuses.includes(task.status)
      )
        return false;
      if (
        filters.searchQuery &&
        !task.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
        !(task.description ?? "")
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase())
      )
        return false;
      if (filters.roles.length > 0) {
        const hasMatchingRole = task.roles?.some((role) =>
          filters.roles.includes(role),
        );
        if (!hasMatchingRole && task.roles && task.roles.length > 0) {
          return false;
        }
      }
      if (filters.topicIds.length > 0) {
        const hasMatchingTopic = task.topicIds?.some((topicId) =>
          filters.topicIds.includes(topicId),
        );
        if (!hasMatchingTopic) return false;
      }
      return true;
    });
  }, [tasks, filters]);
}
