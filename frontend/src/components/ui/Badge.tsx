import { clsx } from "clsx";

type BadgeColor = "default" | "green" | "amber" | "red" | "blue" | "terracotta";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

const colorStyles: Record<BadgeColor, React.CSSProperties> = {
  default: { background: "var(--color-surface-white)", color: "var(--color-text-secondary)" },
  green: { background: "rgba(22, 101, 52, 0.4)", color: "#4ade80" },
  amber: { background: "rgba(146, 64, 14, 0.4)", color: "#fbbf24" },
  red: { background: "rgba(153, 27, 27, 0.4)", color: "#f87171" },
  blue: { background: "rgba(30, 58, 138, 0.4)", color: "#60a5fa" },
  terracotta: { background: "rgba(201, 100, 66, 0.2)", color: "var(--color-cta)" },
};

export function Badge({ children, color = "default", className }: BadgeProps) {
  return (
    <span
      className={clsx("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", className)}
      style={colorStyles[color]}
    >
      {children}
    </span>
  );
}

export function LeadStatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, BadgeColor> = {
    raw: "default",
    enriching: "blue",
    enriched: "blue",
    scored: "terracotta",
    in_sequence: "amber",
    replied: "green",
    converted: "green",
    suppressed: "red",
  };
  return <Badge color={colorMap[status] ?? "default"}>{status.replace("_", " ")}</Badge>;
}
