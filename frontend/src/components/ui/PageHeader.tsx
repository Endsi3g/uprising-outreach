interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  count?: number;
}

export function PageHeader({ title, description, actions, count }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <div className="flex items-baseline gap-3">
          <h1
            className="text-2xl font-medium"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}
          >
            {title}
          </h1>
          {count !== undefined && (
            <span className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
              {count.toLocaleString()}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
