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
      className={clsx("rounded-lg", paddingMap[padding], className)}
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-ring)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
