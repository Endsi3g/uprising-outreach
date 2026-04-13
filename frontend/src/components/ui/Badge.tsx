import { clsx } from "clsx";

type BadgeColor = "default" | "green" | "amber" | "red" | "blue" | "terracotta";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

const colorStyles: Record<BadgeColor, React.CSSProperties> = {
  default: { background: "var(--color-border-warm)", color: "var(--color-text-secondary)" },
  green: { background: "#ecfdf5", color: "#166534" },
  amber: { background: "#fffbeb", color: "#92400e" },
  red: { background: "#fef2f2", color: "#991b1b" },
  blue: { background: "#eff6ff", color: "#1d4ed8" },
  terracotta: { background: "#fef3ee", color: "var(--color-cta)" },
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
