import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  MarkerType,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import { useAppStore } from "@/store";
import { useFilteredTasks } from "@/hooks/useFilteredTasks";
import { TaskNode } from "./TaskNode";

const nodeTypes = { taskNode: TaskNode };

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;

function computeLayout(
  tasks: ReturnType<typeof useFilteredTasks>,
  dependencies: ReturnType<typeof useAppStore.getState>["dependencies"],
  teams: ReturnType<typeof useAppStore.getState>["teams"],
) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 60, ranksep: 140 });

  // Only include tasks that have dependencies or are top-level
  const topLevelTasks = tasks.filter((t) => !t.parentTaskId);
  const taskIds = new Set(topLevelTasks.map((t) => t.id));

  topLevelTasks.forEach((task) => {
    g.setNode(task.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  const validDeps = dependencies.filter(
    (d) => taskIds.has(d.sourceTaskId) && taskIds.has(d.targetTaskId),
  );

  validDeps.forEach((dep) => {
    g.setEdge(dep.sourceTaskId, dep.targetTaskId);
  });

  dagre.layout(g);

  const nodes: Node[] = topLevelTasks.map((task) => {
    const pos = g.node(task.id);
    const team = teams.find((t) => t.id === task.teamId);
    return {
      id: task.id,
      type: "taskNode",
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
      data: { task, teamColor: team?.color ?? "#94A3B8" },
    };
  });

  const depTypeStyles: Record<
    string,
    { animated: boolean; strokeDasharray?: string }
  > = {
    finish_to_start: { animated: false },
    start_to_start: { animated: true, strokeDasharray: "5 5" },
    finish_to_finish: { animated: true, strokeDasharray: "5 5" },
    start_to_finish: { animated: true, strokeDasharray: "5 5" },
  };

  const edges: Edge[] = validDeps.map((dep) => {
    const style = depTypeStyles[dep.type] ?? depTypeStyles.finish_to_start;
    return {
      id: `${dep.sourceTaskId}-${dep.targetTaskId}`,
      source: dep.sourceTaskId,
      target: dep.targetTaskId,
      animated: style.animated,
      style: {
        stroke: "#6366F1",
        strokeWidth: 2,
        strokeDasharray: style.strokeDasharray,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#6366F1" },
    };
  });

  return { nodes, edges };
}

export function GraphView() {
  const tasks = useFilteredTasks();
  const dependencies = useAppStore((s) => s.dependencies);
  const teams = useAppStore((s) => s.teams);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => computeLayout(tasks, dependencies, teams),
    [tasks, dependencies, teams],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update when data changes
  useMemo(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#E5E7EB"
        />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as { teamColor: string };
            return data.teamColor ?? "#94A3B8";
          }}
          style={{ height: 100, width: 150 }}
        />
      </ReactFlow>
    </div>
  );
}
