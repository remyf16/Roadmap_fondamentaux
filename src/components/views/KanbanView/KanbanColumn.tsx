import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { clsx } from "clsx";
import { KanbanCard } from "./KanbanCard";
import type { Task, TaskStatus } from "@/types/models";

const statusConfig: Record<
  TaskStatus,
  { label: string; color: string; bg: string }
> = {
  backlog: { label: "Backlog", color: "text-gray-600", bg: "bg-gray-100" },
  todo: { label: "À faire", color: "text-blue-600", bg: "bg-blue-50" },
  in_progress: {
    label: "En cours",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  review: { label: "Revue", color: "text-purple-600", bg: "bg-purple-50" },
  done: { label: "Terminé", color: "text-green-600", bg: "bg-green-50" },
};

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
}

export function KanbanColumn({ status, tasks }: KanbanColumnProps) {
  const config = statusConfig[status];

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { status },
  });

  return (
    <div
      className={clsx(
        "flex w-72 flex-shrink-0 flex-col rounded-xl transition-colors",
        isOver ? "bg-blue-50/50" : "bg-gray-50/50",
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span
          className={clsx(
            "rounded-md px-2 py-0.5 text-xs font-semibold",
            config.bg,
            config.color,
          )}
        >
          {config.label}
        </span>
        <span className="text-xs text-gray-400">{tasks.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2"
        style={{ minHeight: 100 }}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
