"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { href: "/leads", label: "Leads" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/inbox", label: "Inbox" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col flex-shrink-0 border-r"
        style={{
          width: "var(--sidebar-width)",
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center h-14 px-5 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <span
            className="text-xl font-medium"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}
          >
            ProspectOS
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center px-3 py-2 rounded text-sm font-medium transition-colors",
                  isActive
                    ? "text-near-black bg-warm-gray-200"
                    : "text-warm-gray-600 hover:text-near-black hover:bg-warm-gray-100"
                )}
                style={{
                  color: isActive ? "var(--color-text)" : "var(--color-text-secondary)",
                  background: isActive ? "var(--color-border-warm)" : "transparent",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto" style={{ background: "var(--color-bg)" }}>
        {children}
      </main>
    </div>
  );
}
