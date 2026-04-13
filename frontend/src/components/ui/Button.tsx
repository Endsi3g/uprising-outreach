import { clsx } from "clsx";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "var(--color-cta)",
    color: "#faf9f5",
    boxShadow: "0px 0px 0px 1px var(--color-cta)",
  },
  secondary: {
    background: "var(--color-surface)",
    color: "var(--color-text)",
    boxShadow: "var(--shadow-ring-warm)",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-text-secondary)",
  },
  danger: {
    background: "#3d1111",
    color: "var(--color-error)",
    boxShadow: "0px 0px 0px 1px var(--color-error)",
  },
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-3 text-sm font-semibold rounded-2xl",
  xl: "px-8 py-4 text-base font-bold rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", className, style, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center gap-1.5 font-medium transition-opacity disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed",
          sizeStyles[size],
          className
        )}
        style={{ ...variantStyles[variant], ...style }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
