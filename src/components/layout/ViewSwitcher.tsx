import { LayoutGrid, GanttChart, GitBranch } from "lucide-react";
import { clsx } from "clsx";
import { useAppStore } from "@/store";
import type { ViewType } from "@/types/models";

const views: { key: ViewType; label: string; icon: typeof LayoutGrid }[] = [
  { key: "kanban", label: "Kanban", icon: LayoutGrid },
  { key: "timeline", label: "Timeline", icon: GanttChart },
  { key: "graph", label: "Dépendances", icon: GitBranch },
];

export function ViewSwitcher() {
  const activeView = useAppStore((s) => s.activeView);
  const setActiveView = useAppStore((s) => s.setActiveView);

  return (
    <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
      {views.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setActiveView(key)}
          className={clsx(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
            activeView === key
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </div>
  );
}
