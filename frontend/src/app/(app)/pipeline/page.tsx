"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import type { Opportunity, OpportunityStage } from "@/types/pipeline";

const STAGES: { key: OpportunityStage; label: string; color: string }[] = [
  { key: "new_reply", label: "New reply", color: "#3b82f6" },
  { key: "interested", label: "Interested", color: "#8b5cf6" },
  { key: "qualified", label: "Qualified", color: "#f59e0b" },
  { key: "meeting_booked", label: "Meeting booked", color: "#10b981" },
  { key: "proposal_sent", label: "Proposal sent", color: "#c96442" },
  { key: "won", label: "Won", color: "#166534" },
  { key: "lost", label: "Lost", color: "#6b7280" },
];

export default function PipelinePage() {
  const { data, isLoading, isError } = useQuery<{ data: Opportunity[] }>({
    queryKey: ["pipeline"],
    queryFn: () => apiClient.get("/pipeline/opportunities?limit=200"),
    retry: false,
  });

  const opportunities = data?.data ?? [];

  const byStage = STAGES.reduce(
    (acc, s) => {
      acc[s.key] = opportunities.filter((o) => o.stage === s.key);
      return acc;
    },
    {} as Record<OpportunityStage, Opportunity[]>
  );

  const totalValue = opportunities
    .filter((o) => o.stage !== "lost")
    .reduce((sum, o) => sum + (o.estimated_value ?? 0), 0);

  return (
    <div className="p-6 overflow-x-auto">
      <PageHeader
        title="Pipeline"
        description={
          totalValue > 0
            ? `${opportunities.length} opportunities · €${totalValue.toLocaleString()} pipeline value`
            : "Track opportunities from first reply to closed deal."
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size={24} /></div>
      ) : isError ? (
        <div
          className="mb-6 px-4 py-3 rounded-lg text-sm"
          style={{ background: "#fef3ee", border: "1px solid #fcd9c9", color: "var(--color-cta)" }}
        >
          <span className="font-medium">Pipeline API not available yet</span>
          <p className="mt-0.5 text-xs" style={{ color: "#a0522d" }}>
            Opportunity tracking is built in Phase 3. The kanban structure below shows how it will look.
          </p>
        </div>
      ) : null}

      {/* Kanban board */}
      <div className="flex gap-4 min-w-max pb-6">
        {STAGES.map((stage) => {
          const cards = byStage[stage.key] ?? [];
          return (
            <div
              key={stage.key}
              className="flex flex-col"
              style={{ width: "260px" }}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: stage.color }}
                  />
                  <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                    {stage.label}
                  </span>
                </div>
                <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                  {cards.length}
                </span>
              </div>

              {/* Drop zone */}
              <div
                className="flex-1 rounded-lg min-h-[200px] p-2 space-y-2"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              >
                {cards.length === 0 ? (
                  <div
                    className="flex items-center justify-center h-24 rounded-md border-2 border-dashed text-xs"
                    style={{
                      borderColor: "var(--color-border-warm)",
                      color: "var(--color-text-tertiary)",
                    }}
                  >
                    {isError ? "No data" : "Empty"}
                  </div>
                ) : (
                  cards.map((opp) => (
                    <div
                      key={opp.id}
                      className="p-3 rounded-md cursor-pointer transition-shadow"
                      style={{
                        background: "var(--color-surface-white)",
                        border: "1px solid var(--color-border)",
                        boxShadow: "var(--shadow-ring)",
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-ring-warm)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-ring)")}
                    >
                      <p className="text-xs font-medium truncate" style={{ color: "var(--color-text)" }}>
                        {opp.id.slice(0, 8)}…
                      </p>
                      {opp.estimated_value !== null && (
                        <p className="text-xs mt-1" style={{ color: "var(--color-cta)" }}>
                          €{opp.estimated_value.toLocaleString()}
                        </p>
                      )}
                      {opp.probability !== null && (
                        <div className="mt-2">
                          <div
                            className="h-1 rounded-full"
                            style={{ background: "var(--color-border-warm)" }}
                          >
                            <div
                              className="h-1 rounded-full"
                              style={{
                                width: `${opp.probability}%`,
                                background: stage.color,
                              }}
                            />
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                            {opp.probability}% probability
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
