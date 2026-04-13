"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, Badge } from "@/components/ui";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";

type ClassificationColor = "green" | "amber" | "red" | "blue" | "default";

const CLASSIFICATION_COLOR: Record<string, ClassificationColor> = {
  INTERESTED: "green",
  NOT_INTERESTED: "red",
  QUESTION: "blue",
  OUT_OF_OFFICE: "amber",
  BOUNCE: "red",
  REFERRAL: "green",
};

export default function InboxPage() {
  // Try to fetch conversations — will 404 until Phase 3 models are built
  const { data, isLoading, isError } = useQuery<{ data: unknown[] }>({
    queryKey: ["inbox"],
    queryFn: () => apiClient.get("/inbox/conversations?limit=50"),
    retry: false,
  });

  const conversations = data?.data ?? [];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar: conversation list */}
      <div
        className="w-80 flex-shrink-0 flex flex-col border-r overflow-hidden"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="px-4 py-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h1
            className="text-lg font-medium"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}
          >
            Inbox
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            All replies, unified
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : conversations.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>
                No replies yet
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                Replies from campaigns will appear here once Phase 3 is complete.
              </p>
            </div>
          ) : (
            <div>
              {conversations.map((conv: any) => (
                <div
                  key={conv.id}
                  className="px-4 py-3 cursor-pointer transition-colors"
                  style={{
                    borderBottom: "1px solid var(--color-border)",
                    background: "var(--color-surface-white)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "var(--color-surface)"}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "var(--color-surface-white)"}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>
                      {conv.receiver_email ?? "Unknown sender"}
                    </p>
                    {conv.classification && (
                      <Badge color={CLASSIFICATION_COLOR[conv.classification] ?? "default"} className="flex-shrink-0 text-xs">
                        {conv.classification.toLowerCase()}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text-secondary)" }}>
                    {conv.subject ?? "(no subject)"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                    {conv.received_at ? new Date(conv.received_at).toLocaleDateString() : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main: thread view */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-xl mx-auto"
              style={{ background: "var(--color-border-warm)" }}
            >
              ✉
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>
              {conversations.length === 0 ? "Inbox is empty" : "Select a conversation"}
            </p>
            <p className="text-xs max-w-xs" style={{ color: "var(--color-text-secondary)" }}>
              {conversations.length === 0
                ? "Once campaigns send and prospects reply, threads appear here with AI classification."
                : "Click a conversation on the left to read the thread."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
