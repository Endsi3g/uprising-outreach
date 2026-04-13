type Status = "active" | "pending" | "error" | "paused" | "disconnected";

const colorMap: Record<Status, string> = {
  active: "#16a34a",
  pending: "#ca8a04",
  error: "#dc2626",
  paused: "#6b7280",
  disconnected: "#9ca3af",
};

export function StatusDot({ status, label }: { status: Status; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{ background: colorMap[status] ?? "#9ca3af" }}
      />
      {label && (
        <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          {label}
        </span>
      )}
    </span>
  );
}
