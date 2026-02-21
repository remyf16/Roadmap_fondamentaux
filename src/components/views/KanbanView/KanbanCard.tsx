import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, GitBranch } from "lucide-react";
import { useAppStore } from "@/store";
import { Badge } from "@/components/shared/Badge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import type { Task } from "@/types/models";

interface KanbanCardProps {
  task: Task;
  isDragOverlay?: boolean;
}

export function KanbanCard({ task, isDragOverlay }: KanbanCardProps) {
  const teams = useAppStore((s) => s.teams);
  const sprints = useAppStore((s) => s.sprints);
  const topics = useAppStore((s) => s.topics);
  const tasks = useAppStore((s) => s.tasks);
  const dependencies = useAppStore((s) => s.dependencies);
  const openDetailPanel = useAppStore((s) => s.openDetailPanel);

  const team = teams.find((t) => t.id === task.teamId);
  const sprint = sprints.find((s) => s.id === task.sprintId);
  const taskTopics = topics.filter((t) => task.topicIds?.includes(t.id));
  const subtaskCount = tasks.filter((t) => t.parentTaskId === task.id).length;
  const depCount = dependencies.filter(
    (d) => d.sourceTaskId === task.id || d.targetTaskId === task.id,
  ).length;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={!isDragOverlay ? setNodeRef : undefined}
      style={!isDragOverlay ? style : undefined}
      className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
      onClick={() => openDetailPanel(task.id, "task")}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{task.title}</p>
          {task.description && (
            <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        {!isDragOverlay && (
          <button
            className="ml-2 cursor-grab text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} />
          </button>
        )}
      </div>

      <div className="mb-2">
        <ProgressBar progress={task.progress} color={team?.color} />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {team && <Badge label={team.name} color={team.color} />}
        {taskTopics.map((topic) => (
          <Badge key={topic.id} label={topic.name} color={topic.color} />
        ))}
        {sprint && <Badge label={sprint.name} />}
        {subtaskCount > 0 && (
          <Badge
            label={`${subtaskCount} sous-tâche${subtaskCount > 1 ? "s" : ""}`}
          />
        )}
        {depCount > 0 && (
          <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
            <GitBranch size={12} />
            {depCount}
          </span>
        )}
      </div>
    </div>
  );
}
