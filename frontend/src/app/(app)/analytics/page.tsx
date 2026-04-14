"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Card, Badge } from "@/components/ui";
import { Spinner } from "@/components/ui/Spinner";

/* ─── Mock / fallback data for dashboard display ─────────────────────────── */

const MOCK_CAMPAIGNS = [
  {
    name: "Sites AI — Couvreurs QC",
    status: "active" as const,
    sent: 98,
    replies: 11,
    positives: 4,
  },
  {
    name: "App IA — Électriciens MTL",
    status: "paused" as const,
    sent: 87,
    replies: 6,
    positives: 2,
  },
];

const MOCK_INBOX = [
  {
    initials: "MO",
    name: "Marc Ouellet",
    time: "10:24",
    preview: "Oui ça m\u2019intéresse, on pourrait se parler cette semaine?",
    sentiment: "positive" as const,
  },
  {
    initials: "YT",
    name: "Yves Tremblay",
    time: "09:11",
    preview: "C\u2019est quoi exactement votre offre pour un plombier?",
    sentiment: "neutral" as const,
  },
  {
    initials: "DL",
    name: "Denis Leblanc",
    time: "Hier",
    preview: "Pas intéressé merci",
    sentiment: "negative" as const,
  },
  {
    initials: "LA",
    name: "Lucie Archambault",
    time: "Hier",
    preview: "Auto-reply: Je suis absent jusqu\u2019au 15 avril...",
    sentiment: "auto" as const,
  },
];

const MOCK_PIPELINE = [
  { stage: "Interested", items: [{ name: "Toiture ProMax", value: 2400 }] },
  { stage: "Qualified", items: [{ name: "Maçonnerie Leblanc", value: 1800 }] },
  { stage: "Meeting Booked", items: [{ name: "Plomberie Express", value: 3200 }] },
  { stage: "Proposal Sent", items: [{ name: "Peinture Archambault", value: 2100 }] },
];

const SENTIMENT_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  positive: { bg: "rgba(22,101,52,0.25)", text: "#4ade80", label: "positive" },
  neutral: { bg: "rgba(30,58,138,0.25)", text: "#60a5fa", label: "neutral" },
  negative: { bg: "rgba(153,27,27,0.25)", text: "#f87171", label: "negative" },
  auto: { bg: "var(--color-surface-2)", text: "var(--color-text-tertiary)", label: "auto" },
};

interface LeadStats {
  total_leads: int;
  qualified_leads: int;
  sent_emails: int;
  replied_leads: int;
  status_counts: Record<string, int>;
  source_stats: Array<{
    name: string;
    sent: int;
    replies: int;
    positives: int;
    status: string;
  }>;
  recent_replies: Array<{
    id: string;
    contact_id?: string;
    source?: string;
    notes?: string;
    updated_at: string;
    # Add other fields as needed for the UI mapping
  }>;
}

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ["leads-stats"],
    queryFn: () => apiClient.get("/leads/stats"),
    staleTime: 30_000,
  });

  const { data: sendersData } = useQuery<any[]>({
    queryKey: ["senders"],
    queryFn: () => apiClient.get("/senders"),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size={32} />
      </div>
    );
  }

  const s = stats || {};
  const totalLeads = s.total_leads ?? 0;
  const qualifiedLeads = s.qualified_leads ?? 0;
  const activeSenders = sendersData?.filter((s: any) => s.status === "active").length ?? 0;
  const pausedSenders = sendersData?.filter((s: any) => s.status === "paused").length ?? 0;
  const sentEmails = s.sent_emails ?? 0;
  const repliedLeads = s.replied_leads ?? 0;
  
  const replyRate = sentEmails > 0 ? Math.round((repliedLeads / sentEmails) * 100) : 0;
  // Positive rate: leads with high scores / replies (proxy)
  const positiveRate = repliedLeads > 0 ? Math.round((qualifiedLeads / repliedLeads) * 100) : 0;

  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const kpis = [
    { label: "Leads total", value: String(totalLeads), sub: `${qualifiedLeads} qualifiés` },
    { label: "Campagnes actives", value: String(activeSenders), sub: `${pausedSenders} en pause` },
    { label: "Emails envoyés", value: String(sentEmails), sub: "Total" },
    { label: "Reply rate", value: `${replyRate}%`, sub: `${repliedLeads} réponses` },
    { label: "Positive rate", value: `${positiveRate}%`, sub: `${qualifiedLeads} positives` },
  ];

  // Pipeline stages mapping
  const statusCounts = s.status_counts || {};
  const pipeline = [
    { stage: "Interested", items: statusCounts.raw || 0 },
    { stage: "Qualified", items: statusCounts.scored || 0 },
    { stage: "In Sequence", items: statusCounts.in_sequence || 0 },
    { stage: "Replied", items: statusCounts.replied || 0 },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1100px] mx-auto">
      {/* ── Greeting ─────────────────────────────────────────────── */}
      <div className="mb-8 animate-fade-in">
        <h1
          className="text-2xl font-medium flex items-center gap-2"
          style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}
        >
          Bonjour, Kael <span className="text-xl">👋</span>
        </h1>
        <p className="text-sm mt-1 capitalize" style={{ color: "var(--color-text-secondary)" }}>
          {dateStr} · Uprising Studio
        </p>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {kpis.map(({ label, value, sub }, i) => (
          <div
            key={label}
            className="px-4 py-4 rounded-xl card-hover animate-fade-in"
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              animationDelay: `${i * 60}ms`,
              animationFillMode: "both",
            }}
          >
            <p className="text-xs uppercase tracking-wide font-medium mb-2" style={{ color: "var(--color-text-tertiary)" }}>
              {label}
            </p>
            <p
              className="text-3xl font-medium tabular-nums"
              style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}
            >
              {value}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Two-Column: Campaigns + Inbox ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {/* Active Campaigns */}
        <div className="animate-fade-in" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
          <h2
            className="text-base font-medium mb-4"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}
          >
            Canaux de prospection
          </h2>
          <div className="space-y-3">
            {s.source_stats?.length > 0 ? s.source_stats.map((c: any) => (
              <div
                key={c.name}
                className="px-4 py-3.5 rounded-xl card-hover"
                style={{
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{c.name}</p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: "rgba(22,101,52,0.25)",
                      color: "#4ade80",
                    }}
                  >
                    {c.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  <span><strong className="text-sm tabular-nums" style={{ color: "var(--color-text)" }}>{c.sent}</strong> envoyés</span>
                  <span><strong className="text-sm tabular-nums" style={{ color: "var(--color-text)" }}>{c.replies}</strong> réponses</span>
                  <span><strong className="text-sm tabular-nums" style={{ color: "#4ade80" }}>{c.positives}</strong> positives</span>
                </div>
              </div>
            )) : (
              <div className="text-xs p-8 text-center border rounded-xl border-dashed" style={{ color: "var(--color-text-tertiary)" }}>
                Aucune donnée de campagne disponible.
              </div>
            )}
          </div>
        </div>

        {/* Recent Inbox */}
        <div className="animate-fade-in" style={{ animationDelay: "280ms", animationFillMode: "both" }}>
          <h2
            className="text-base font-medium mb-4"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}
          >
            Inbox récente
          </h2>
          <div className="space-y-1">
            {s.recent_replies?.length > 0 ? s.recent_replies.map((msg: any) => {
              const initials = msg.notes?.split(' ').map((n: string) => n[0]).join('').slice(0,2) || "??";
              const time = new Date(msg.updated_at).toLocaleTimeString("fr-CA", { hour: '2-digit', minute: '2-digit' });
              return (
                <div
                  key={msg.id}
                  className="flex items-start gap-3 px-4 py-3 rounded-xl interactive cursor-pointer"
                  style={{ background: "transparent" }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{ background: "var(--color-surface-2)", color: "var(--color-text)" }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>Lead #{msg.id.slice(0,5)}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs tabular-nums" style={{ color: "var(--color-text-tertiary)" }}>{time}</span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded font-medium"
                          style={{ background: "rgba(22,101,52,0.25)", color: "#4ade80" }}
                        >
                          replied
                        </span>
                      </div>
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text-secondary)" }}>{msg.source || "Pas de source"}</p>
                  </div>
                </div>
              );
            }) : (
              <div className="text-xs p-8 text-center border rounded-xl border-dashed" style={{ color: "var(--color-text-tertiary)" }}>
                Aucune réponse récente.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Pipeline Row ──────────────────────────────────────── */}
      <div className="animate-fade-in" style={{ animationDelay: "360ms", animationFillMode: "both" }}>
        <h2
          className="text-base font-medium mb-4"
          style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}
        >
          Pipeline — opportunités actives
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {pipeline.map((col) => (
            <div key={col.stage}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>{col.stage}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--color-surface-2)", color: "var(--color-text-tertiary)" }}>{col.items}</span>
              </div>
              <div
                className="px-3.5 py-3 rounded-xl card-hover cursor-pointer opacity-50"
                style={{
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <p className="text-[10px] uppercase font-bold" style={{ color: "var(--color-text-tertiary)" }}>Valeur estimée</p>
                <p className="text-lg font-medium tabular-nums" style={{ color: "var(--color-text)" }}>
                  ${(col.items * 250).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
