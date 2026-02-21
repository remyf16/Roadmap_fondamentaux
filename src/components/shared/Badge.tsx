import { clsx } from "clsx";

interface BadgeProps {
  label: string;
  color?: string;
  size?: "sm" | "md";
}

export function Badge({ label, color, size = "sm" }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
      )}
      style={{
        backgroundColor: color ? `${color}20` : "#e5e7eb",
        color: color ?? "#374151",
      }}
    >
      {label}
    </span>
  );
}
