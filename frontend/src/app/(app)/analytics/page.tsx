"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui";
import { Spinner } from "@/components/ui/Spinner";

interface FunnelStep {
  status: string;
  count: number;
}

interface MailboxHealth {
  email_address: string;
  status: string;
  spf_valid: boolean | null;
  dkim_valid: boolean | null;
  dmarc_policy: string | null;
  daily_send_limit: number;
}

export default function AnalyticsPage() {
  // Leads stats are available now (from leads API)
  const { data: leadsData } = useQuery<{ pagination: { total_count: number } }>({
    queryKey: ["analytics-leads-count"],
    queryFn: () => apiClient.get("/leads?limit=1"),
    staleTime: 60_000,
  });

  const { data: sendersData } = useQuery<MailboxHealth[]>({
    queryKey: ["senders"],
    queryFn: () => apiClient.get("/senders"),
    staleTime: 60_000,
  });

  const totalLeads = leadsData?.pagination?.total_count ?? 0;
  const senders = sendersData ?? [];
  const healthySenders = senders.filter((s) => s.status === "active").length;

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="Analytics"
        description="Platform-wide metrics and email infrastructure health."
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total leads", value: totalLeads.toLocaleString(), note: "in workspace" },
          { label: "Active senders", value: `${healthySenders} / ${senders.length}`, note: "mailboxes" },
          { label: "Campaigns sent", value: "—", note: "available in Phase 2" },
          { label: "Reply rate", value: "—", note: "available in Phase 3" },
        ].map(({ label, value, note }) => (
          <Card key={label} padding="md">
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--color-text-tertiary)" }}>
              {label}
            </p>
            <p
              className="text-2xl font-medium"
              style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}
            >
              {value}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>{note}</p>
          </Card>
        ))}
      </div>

      {/* Mailbox health table */}
      <Card padding="none">
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2 className="text-base font-medium" style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}>
            Mailbox health
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            SPF / DKIM / DMARC status for all connected sender accounts.
          </p>
        </div>

        {senders.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              No sender accounts configured yet. Go to{" "}
              <a href="/settings/senders" className="underline" style={{ color: "var(--color-cta)" }}>
                Settings → Senders
              </a>{" "}
              to add one.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {["Mailbox", "Status", "SPF", "DKIM", "DMARC", "Daily limit"].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {senders.map((sender) => (
                <tr
                  key={sender.email_address}
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                >
                  <td className="px-5 py-3" style={{ color: "var(--color-text)" }}>
                    {sender.email_address}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs"
                      style={{
                        color: sender.status === "active" ? "#166534" : sender.status === "error" ? "var(--color-error)" : "var(--color-text-secondary)",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: sender.status === "active" ? "#16a34a" : sender.status === "error" ? "var(--color-error)" : "#9ca3af",
                        }}
                      />
                      {sender.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs">
                    {sender.spf_valid === null ? "—" : sender.spf_valid ? (
                      <span style={{ color: "#166534" }}>✓ Valid</span>
                    ) : (
                      <span style={{ color: "var(--color-error)" }}>✗ Missing</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs">
                    {sender.dkim_valid === null ? "—" : sender.dkim_valid ? (
                      <span style={{ color: "#166534" }}>✓ Valid</span>
                    ) : (
                      <span style={{ color: "var(--color-error)" }}>✗ Missing</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs">
                    {sender.dmarc_policy ? (
                      <span style={{ color: sender.dmarc_policy === "reject" ? "#166534" : "#92400e" }}>
                        {sender.dmarc_policy}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {sender.daily_send_limit}/day
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Coming soon: funnel */}
      <div className="mt-8">
        <Card padding="md" style={{ opacity: 0.6 }}>
          <h3 className="text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>
            Conversion funnel
          </h3>
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            Leads → Enriched → Scored → In sequence → Replied → Converted. Available when campaigns are running (Phase 2+).
          </p>
          <div className="flex items-end gap-2 mt-4 h-16">
            {[100, 78, 55, 34, 18, 8].map((pct, i) => (
              <div
                key={i}
                className="flex-1 rounded-t"
                style={{
                  height: `${pct}%`,
                  background: i === 0 ? "var(--color-border-warm)" : "var(--color-border)",
                }}
              />
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            {["Imported", "Enriched", "Scored", "Sent", "Replied", "Converted"].map((l) => (
              <p key={l} className="flex-1 text-xs text-center" style={{ color: "var(--color-text-tertiary)" }}>{l}</p>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
