import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({ children, className, style, padding = "md" }: CardProps) {
  return (
    <div
      className={clsx(paddingMap[padding], className)}
      style={{
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface)",
        boxShadow: "0 0 0 1px var(--color-border-subtle)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
