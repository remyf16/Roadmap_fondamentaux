import clsx from "clsx";

export const GROUP_HEADER_HEIGHT = 32;

interface TimelineGroupHeaderProps {
  label: string;
  count: number;
  color?: string;
  width: number;
  depth?: number;
}

export function TimelineGroupHeader({
  label,
  count,
  color,
  width,
  depth = 0,
}: TimelineGroupHeaderProps) {
  return (
    <div
      className={clsx(
        "flex items-center border-b",
        depth === 0
          ? "border-gray-200 bg-gray-50/80"
          : "border-gray-100 bg-gray-50/50",
      )}
      style={{ width, height: GROUP_HEADER_HEIGHT }}
    >
      <div
        className={clsx(
          "sticky left-0 z-10 flex items-center gap-2 py-1",
          depth === 0 ? "bg-gray-50/80 px-3" : "bg-gray-50/50",
        )}
        style={{ paddingLeft: 12 + depth * 16 }}
      >
        {color && (
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
        <span
          className={clsx(
            "text-xs text-gray-700",
            depth === 0 ? "font-semibold" : "font-medium",
          )}
        >
          {label}
        </span>
        <span className="text-xs text-gray-400">({count})</span>
      </div>
    </div>
  );
}
