"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button, Badge, Card } from "@/components/ui";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import type { Campaign } from "@/types/campaigns";

const STATUS_COLOR: Record<string, "green" | "amber" | "default" | "blue" | "red"> = {
  active: "green",
  paused: "amber",
  draft: "default",
  completed: "blue",
  archived: "red",
};

export default function CampaignsPage() {
  const { data: campaigns, isLoading } = useQuery<{ data: Campaign[] }>({
    queryKey: ["campaigns"],
    queryFn: () => apiClient.get("/campaigns?limit=50"),
    retry: false,
  });

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="Campaigns"
        description="Build and manage email outreach sequences."
        actions={
          <Button variant="primary" size="sm" disabled title="Campaign builder available in Phase 2">
            New campaign
          </Button>
        }
      />

      {/* Phase banner */}
      <div
        className="mb-6 px-4 py-3 rounded-lg text-sm flex items-start gap-3"
        style={{
          background: "#fef3ee",
          border: "1px solid #fcd9c9",
          color: "var(--color-cta)",
        }}
      >
        <span className="text-base">◎</span>
        <div>
          <span className="font-medium">Campaign builder coming in Phase 2</span>
          <p className="mt-0.5 text-xs" style={{ color: "#a0522d" }}>
            First: complete lead enrichment, ICP scoring, and template library. Then campaigns unlock.
            See <code>docs/NEXT_STEPS.md</code> for the full roadmap.
          </p>
        </div>
      </div>

      {/* What will be here */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: "⟳", title: "Sequence builder", desc: "Multi-step email sequences with branching logic, delays, and reply conditions." },
          { icon: "⚡", title: "Launch validation", desc: "Automatic DNS checks + email verification gates before any send." },
          { icon: "◎", title: "Send scheduling", desc: "Per-mailbox daily limits, optimal send windows, and warmup awareness." },
        ].map(({ icon, title, desc }) => (
          <Card key={title} padding="md" style={{ opacity: 0.6 }}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm mb-3"
              style={{ background: "var(--color-border-warm)" }}
            >
              {icon}
            </div>
            <h3 className="text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>{title}</h3>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{desc}</p>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <EmptyState
          title="No campaigns yet"
          description="Complete Phase 2 setup to start building campaigns."
        />
      )}
    </div>
  );
}
