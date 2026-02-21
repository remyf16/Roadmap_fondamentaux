import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useAppStore } from "@/store";
import type { Task } from "@/types/models";

interface TaskNodeData {
  task: Task;
  teamColor: string;
  [key: string]: unknown;
}

const statusLabels: Record<string, string> = {
  backlog: "Backlog",
  todo: "À faire",
  in_progress: "En cours",
  review: "Revue",
  done: "Terminé",
};

export function TaskNode({ data }: NodeProps) {
  const nodeData = data as TaskNodeData;
  const { task, teamColor } = nodeData;
  const openDetailPanel = useAppStore((s) => s.openDetailPanel);

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-white !bg-gray-400"
      />
      <div
        className="cursor-pointer rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
        style={{ width: 220 }}
        onClick={() => openDetailPanel(task.id, "task")}
      >
        <div
          className="h-1.5 rounded-t-lg"
          style={{ backgroundColor: teamColor }}
        />
        <div className="p-3">
          <p className="text-sm font-semibold text-gray-900">{task.title}</p>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {statusLabels[task.status] ?? task.status}
            </span>
            <span className="text-xs font-medium" style={{ color: teamColor }}>
              {task.progress}%
            </span>
          </div>
          <div className="mt-1.5 h-1 rounded-full bg-gray-100">
            <div
              className="h-1 rounded-full transition-all"
              style={{ width: `${task.progress}%`, backgroundColor: teamColor }}
            />
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-white !bg-gray-400"
      />
    </>
  );
}
