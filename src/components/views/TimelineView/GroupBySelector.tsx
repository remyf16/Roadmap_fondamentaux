import clsx from "clsx";
import { Layers, X } from "lucide-react";
import { useAppStore } from "@/store";
import type { GroupByType } from "@/types/models";

const OPTIONS: { value: GroupByType; label: string }[] = [
  { value: "topic", label: "Par thème" },
  { value: "role", label: "Par métier" },
  { value: "month", label: "Par mois" },
];

export function GroupBySelector() {
  const groupByLevels = useAppStore((s) => s.groupByLevels);
  const toggleGroupByLevel = useAppStore((s) => s.toggleGroupByLevel);
  const clearGroupBy = useAppStore((s) => s.clearGroupBy);

  return (
    <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
        <Layers size={14} />
        <span>Regrouper par</span>
      </div>
      <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
        {OPTIONS.map((option) => {
          const levelIndex = groupByLevels.indexOf(option.value);
          const isActive = levelIndex !== -1;

          return (
            <button
              key={option.value}
              onClick={() => toggleGroupByLevel(option.value)}
              className={clsx(
                "relative px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                isActive
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              {isActive && groupByLevels.length > 1 && (
                <span className="absolute -top-1.5 -left-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                  {levelIndex + 1}
                </span>
              )}
              {option.label}
            </button>
          );
        })}
      </div>
      {groupByLevels.length > 0 && (
        <button
          onClick={clearGroupBy}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          title="Réinitialiser le regroupement"
        >
          <X size={12} />
          <span>Réinitialiser</span>
        </button>
      )}
    </div>
  );
}
