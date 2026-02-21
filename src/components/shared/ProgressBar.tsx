interface ProgressBarProps {
  progress: number;
  color?: string;
}

export function ProgressBar({ progress, color = "#22C55E" }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-gray-200">
        <div
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: `${Math.min(100, Math.max(0, progress))}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className="text-xs text-gray-500 tabular-nums">{progress}%</span>
    </div>
  );
}
