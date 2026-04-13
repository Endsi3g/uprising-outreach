"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useLeadsStore } from "@/store/leads";
import { LeadStatusBadge, Badge, Button } from "@/components/ui";
import { Spinner } from "@/components/ui/Spinner";
import type { Lead } from "@/types/leads";

interface ActivityEntry {
  id: string;
  event_type: string;
  payload: Record<string, unknown> | null;
  created_at: string;
}

export function LeadDrawer() {
  const { isDrawerOpen, drawerLeadId, closeDrawer } = useLeadsStore();
  const queryClient = useQueryClient();

  const { data: lead, isLoading } = useQuery<Lead>({
    queryKey: ["lead", drawerLeadId],
    queryFn: () => apiClient.get<Lead>(`/leads/${drawerLeadId}`),
    enabled: !!drawerLeadId && isDrawerOpen,
  });

  const { data: activityData } = useQuery<{ data: ActivityEntry[] }>({
    queryKey: ["lead-activity", drawerLeadId],
    queryFn: () => apiClient.get(`/leads/${drawerLeadId}/activity?limit=20`),
    enabled: !!drawerLeadId && isDrawerOpen,
  });

  const suppressMutation = useMutation({
    mutationFn: () => apiClient.patch(`/leads/${drawerLeadId}`, { status: "suppressed" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", drawerLeadId] });
    },
  });

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-30"
        style={{ background: "rgba(20,20,19,0.2)" }}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 bottom-0 z-40 flex flex-col overflow-hidden"
        style={{
          width: "420px",
          background: "var(--color-surface)",
          borderLeft: "1px solid var(--color-border)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2
            className="text-lg font-medium"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}
          >
            Lead detail
          </h2>
          <Button variant="ghost" size="sm" onClick={closeDrawer}>✕</Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : lead ? (
            <div className="px-5 py-5 space-y-6">
              {/* Status + Score row */}
              <div className="flex items-center gap-3">
                <LeadStatusBadge status={lead.status} />
                {lead.score !== null && (
                  <Badge color={lead.score >= 70 ? "green" : lead.score >= 40 ? "amber" : "default"}>
                    Score {lead.score}
                  </Badge>
                )}
                {lead.temperature !== "cold" && (
                  <Badge color={lead.temperature === "hot" ? "red" : "amber"}>
                    {lead.temperature}
                  </Badge>
                )}
              </div>

              {/* Fields */}
              <section>
                <h3 className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: "var(--color-text-tertiary)" }}>
                  Details
                </h3>
                <dl className="space-y-2">
                  {[
                    ["Source", lead.source],
                    ["Enrichment", lead.enrichment_status],
                    ["Next action", lead.next_action],
                    ["Added", new Date(lead.created_at).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })],
                    ["Updated", new Date(lead.updated_at).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })],
                  ].map(([label, value]) =>
                    value ? (
                      <div key={label} className="flex gap-3 text-sm">
                        <dt className="w-28 flex-shrink-0" style={{ color: "var(--color-text-secondary)" }}>{label}</dt>
                        <dd style={{ color: "var(--color-text)" }}>{value}</dd>
                      </div>
                    ) : null
                  )}
                </dl>
              </section>

              {/* Notes */}
              {lead.notes && (
                <section>
                  <h3 className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: "var(--color-text-tertiary)" }}>
                    Notes
                  </h3>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                    {lead.notes}
                  </p>
                </section>
              )}

              {/* Activity timeline */}
              {activityData && activityData.data.length > 0 && (
                <section>
                  <h3 className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: "var(--color-text-tertiary)" }}>
                    Activity
                  </h3>
                  <ol className="space-y-3">
                    {activityData.data.map((entry) => (
                      <li key={entry.id} className="flex gap-3">
                        <div
                          className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: "var(--color-border-warm)", marginTop: "6px" }}
                        />
                        <div>
                          <p className="text-sm" style={{ color: "var(--color-text)" }}>
                            {entry.event_type.replace(/\./g, " ")}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                            {new Date(entry.created_at).toLocaleString()}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </div>
          ) : (
            <p className="px-5 py-10 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Lead not found.
            </p>
          )}
        </div>

        {/* Footer actions */}
        {lead && (
          <div
            className="flex items-center gap-2 px-5 py-4 border-t flex-shrink-0"
            style={{ borderColor: "var(--color-border)" }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => suppressMutation.mutate()}
              disabled={lead.status === "suppressed"}
            >
              Suppress
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
