import { clsx } from "clsx";
import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "w-full px-3 py-2 text-sm rounded-md border transition-colors",
            "focus:outline-none focus:ring-1 focus:ring-focus",
            className
          )}
          style={{
            background: "var(--color-surface-white)",
            color: "var(--color-text)",
            borderColor: error ? "var(--color-error)" : "var(--color-border)",
          }}
          {...props}
        />
        {error && (
          <p className="text-xs" style={{ color: "var(--color-error)" }}>{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={clsx(
            "w-full px-3 py-2 text-sm rounded-md border transition-colors resize-y",
            "focus:outline-none focus:ring-1 focus:ring-focus",
            className
          )}
          style={{
            background: "var(--color-surface-white)",
            color: "var(--color-text)",
            borderColor: error ? "var(--color-error)" : "var(--color-border)",
            minHeight: "80px",
          }}
          {...props}
        />
        {error && (
          <p className="text-xs" style={{ color: "var(--color-error)" }}>{error}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
