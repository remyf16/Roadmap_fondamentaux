import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { useAppStore } from "@/store";
import { useFilteredTasks } from "@/hooks/useFilteredTasks";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import type { Task, TaskStatus } from "@/types/models";

const statuses: TaskStatus[] = [
  "backlog",
  "todo",
  "in_progress",
  "review",
  "done",
];

export function KanbanView() {
  const allTasks = useFilteredTasks();
  // Only show top-level tasks in Kanban
  const tasks = allTasks.filter((t) => !t.parentTaskId);
  const moveTask = useAppStore((s) => s.moveTask);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    // Determine target status from column or card
    let targetStatus: TaskStatus | undefined;

    if (String(over.id).startsWith("column-")) {
      targetStatus = String(over.id).replace("column-", "") as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) targetStatus = overTask.status;
    }

    if (targetStatus && activeTask.status !== targetStatus) {
      moveTask(activeTask.id, targetStatus, activeTask.order);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    let targetStatus: TaskStatus;

    if (String(over.id).startsWith("column-")) {
      targetStatus = String(over.id).replace("column-", "") as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === over.id);
      if (!overTask) return;
      targetStatus = overTask.status;
    }

    const overTasks = tasks.filter((t) => t.status === targetStatus);
    const overIndex = overTasks.findIndex((t) => t.id === over.id);
    const newOrder = overIndex >= 0 ? overIndex : overTasks.length;

    moveTask(active.id as string, targetStatus, newOrder);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto p-4">
        {statuses.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks
              .filter((t) => t.status === status)
              .sort((a, b) => a.order - b.order)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} isDragOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
