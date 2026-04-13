interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-xl"
        style={{ background: "var(--color-border-warm)" }}
      >
        ◈
      </div>
      <h3
        className="text-lg font-medium mb-2"
        style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}
      >
        {title}
      </h3>
      {description && (
        <p className="text-sm mb-6 max-w-xs" style={{ color: "var(--color-text-secondary)" }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
