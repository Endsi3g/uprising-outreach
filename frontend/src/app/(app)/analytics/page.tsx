"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Card, Badge } from "@/components/ui";
import { Spinner } from "@/components/ui/Spinner";
import { useCurrentUser } from "@/hooks/useCurrentUser";

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
  total_leads: number;
  qualified_leads: number;
  sent_emails: number;
  replied_leads: number;
  status_counts: Record<string, number>;
  source_stats: Array<{
    name: string;
    sent: number;
    replies: number;
    positives: number;
    status: string;
  }>;
  recent_replies: Array<{
    id: string;
    contact_id?: string;
    source?: string;
    notes?: string;
    updated_at: string;
    // Add other fields as needed for the UI mapping
  }>;
}

export default function AnalyticsPage() {
  const { data: user } = useCurrentUser();
  const { data: stats, isLoading } = useQuery<LeadStats>({
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
    <div className="p-6 lg:p-12 max-w-[1200px] mx-auto animate-fade-in">
      {/* ── Greeting ─────────────────────────────────────────────── */}
      <div className="mb-12 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <span className="text-[--color-cta] text-2xl">✺</span>
          <h1
            className="text-4xl font-normal leading-tight"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}
          >
            Bonjour, {user?.first_name ?? "…"}
          </h1>
        </div>
        <p className="text-sm uppercase tracking-[0.1em] font-medium" style={{ color: "var(--color-text-tertiary)" }}>
          {dateStr} · Uprising Studio
        </p>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
        {kpis.map(({ label, value, sub }, i) => (
          <div
            key={label}
            className="px-5 py-5 rounded-2xl animate-fade-in"
            style={{
              background: "var(--color-surface)",
              boxShadow: "0 0 0 1px var(--color-border-subtle)",
              animationDelay: `${i * 60}ms`,
              animationFillMode: "both",
            }}
          >
            <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: "var(--color-text-tertiary)" }}>
              {label}
            </p>
            <p
              className="text-4xl font-normal tabular-nums mb-1"
              style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}
            >
              {value}
            </p>
            <p className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Two-Column: Campaigns + Inbox ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Active Campaigns */}
        <div className="animate-fade-in" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
          <h2
            className="text-xl font-normal mb-6"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}
          >
            Canaux de prospection
          </h2>
          <div className="space-y-0 border-t border-[--color-border-subtle]">
            {s.source_stats?.length > 0 ? s.source_stats.map((c: any) => (
              <div
                key={c.name}
                className="py-5 border-b border-[--color-border-subtle] interactive group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-base font-medium group-hover:text-[--color-cta] transition-colors" style={{ color: "var(--color-text)" }}>{c.name}</p>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                    style={{
                      background: "var(--color-surface-2)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {c.status}
                  </span>
                </div>
                <div className="flex items-center gap-5 text-sm" style={{ color: "var(--color-text-tertiary)" }}>
                  <span><strong className="font-semibold tabular-nums" style={{ color: "var(--color-text)" }}>{c.sent}</strong> envoyés</span>
                  <span><strong className="font-semibold tabular-nums" style={{ color: "var(--color-text)" }}>{c.replies}</strong> réponses</span>
                  <span><strong className="font-semibold tabular-nums text-[--color-cta]" style={{ color: "" }}>{c.positives}</strong> positives</span>
                </div>
              </div>
            )) : (
              <div className="text-xs py-10 text-center border-b border-[--color-border-subtle]" style={{ color: "var(--color-text-tertiary)" }}>
                Aucune donnée de campagne disponible.
              </div>
            )}
          </div>
        </div>

        {/* Recent Inbox */}
        <div className="animate-fade-in" style={{ animationDelay: "280ms", animationFillMode: "both" }}>
          <h2
            className="text-xl font-normal mb-6"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}
          >
            Inbox récente
          </h2>
          <div className="space-y-0 border-t border-[--color-border-subtle]">
            {s.recent_replies?.length > 0 ? s.recent_replies.map((msg: any) => {
              const initials = msg.notes?.split(' ').map((n: string) => n[0]).join('').slice(0,2) || "??";
              const time = new Date(msg.updated_at).toLocaleTimeString("fr-CA", { hour: '2-digit', minute: '2-digit' });
              return (
                <div
                  key={msg.id}
                  className="flex items-start gap-4 py-5 border-b border-[--color-border-subtle] interactive cursor-pointer group"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-transform group-hover:scale-105"
                    style={{ background: "var(--color-surface-2)", color: "var(--color-text)" }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-base font-medium truncate mb-0.5" style={{ color: "var(--color-text)" }}>Lead #{msg.id.slice(0,5)}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs tabular-nums" style={{ color: "var(--color-text-tertiary)" }}>{time}</span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                          style={{ background: "var(--color-surface-2)", color: "var(--color-text-tertiary)" }}
                        >
                          replied
                        </span>
                      </div>
                    </div>
                    <p className="text-sm truncate" style={{ color: "var(--color-text-secondary)" }}>{msg.source || "Génération automatique"}</p>
                  </div>
                </div>
              );
            }) : (
              <div className="text-xs py-10 text-center border-b border-[--color-border-subtle]" style={{ color: "var(--color-text-tertiary)" }}>
                Aucune réponse récente.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Pipeline Row ──────────────────────────────────────── */}
      <div className="animate-fade-in" style={{ animationDelay: "360ms", animationFillMode: "both" }}>
        <h2
          className="text-xl font-normal mb-6"
          style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}
        >
          Pipeline — opportunités actives
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {pipeline.map((col) => (
            <div key={col.stage}>
              <div className="flex items-center justify-between mb-3 px-1 text-[10px] uppercase tracking-widest font-bold" style={{ color: "var(--color-text-tertiary)" }}>
                <span>{col.stage}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-[--color-surface-2]">{col.items}</span>
              </div>
              <div
                className="px-5 py-5 rounded-2xl cursor-pointer transition-all hover:bg-[--color-surface-2]"
                style={{
                  background: "var(--color-surface)",
                  boxShadow: "0 0 0 1px var(--color-border-subtle)",
                }}
              >
                <p className="text-[10px] uppercase font-bold tracking-wider mb-2" style={{ color: "var(--color-text-tertiary)" }}>Valeur estimée</p>
                <p className="text-2xl font-normal tabular-nums" style={{ color: "var(--color-text)", fontFamily: "var(--font-serif)" }}>
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
