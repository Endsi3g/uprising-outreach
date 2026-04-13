"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useLeadsStore } from "@/store/leads";
import { LeadStatusBadge, Button } from "@/components/ui";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import type { Lead, Page } from "@/types/leads";

export function LeadsTable() {
  const queryClient = useQueryClient();
  const { selectedIds, toggleSelect, selectAll, clearSelection, openImportModal, openDrawer } = useLeadsStore();
  const [cursor, setCursor] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const queryUrl = cursor
    ? `/leads?cursor=${cursor}${statusFilter !== "all" ? `&status=${statusFilter}` : ""}`
    : `/leads?limit=50${statusFilter !== "all" ? `&status=${statusFilter}` : ""}`;

  const { data, isLoading, isError } = useQuery<Page<Lead>>({
    queryKey: ["leads", cursor, statusFilter],
    queryFn: () => apiClient.get<Page<Lead>>(queryUrl),
    staleTime: 30_000,
  });

  const bulkMutation = useMutation({
    mutationFn: (payload: { action: string; lead_ids: string[] }) =>
      apiClient.post("/leads/bulk-action", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      clearSelection();
    },
  });

  const leads = data?.data ?? [];
  const pagination = data?.pagination;
  const allSelected = leads.length > 0 && leads.every((l) => selectedIds.has(l.id));

  const STATUS_FILTERS = [
    { value: "all", label: "All" },
    { value: "raw", label: "Raw" },
    { value: "enriched", label: "Enriched" },
    { value: "scored", label: "Scored" },
    { value: "in_sequence", label: "In sequence" },
    { value: "replied", label: "Replied" },
    { value: "converted", label: "Converted" },
  ];

  return (
    <div>
      <PageHeader
        title="Leads"
        count={pagination?.total_count}
        actions={
          <Button variant="primary" size="sm" onClick={openImportModal}>
            Import CSV
          </Button>
        }
      />

      {/* Filter bar */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setCursor(null); }}
            className="px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors"
            style={{
              background: statusFilter === f.value ? "var(--color-near-black)" : "transparent",
              color: statusFilter === f.value ? "#faf9f5" : "var(--color-text-secondary)",
              border: `1px solid ${statusFilter === f.value ? "transparent" : "var(--color-border)"}`,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-md mb-3 text-sm"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-warm)",
            boxShadow: "var(--shadow-ring)",
          }}
        >
          <span className="font-medium" style={{ color: "var(--color-text)" }}>
            {selectedIds.size} selected
          </span>
          <div className="flex-1" />
          <Button size="sm" variant="secondary"
            onClick={() => bulkMutation.mutate({ action: "enrich", lead_ids: [...selectedIds] })}
            disabled={bulkMutation.isPending}
          >
            Enrich
          </Button>
          <Button size="sm" variant="secondary"
            onClick={() => bulkMutation.mutate({ action: "suppress", lead_ids: [...selectedIds] })}
            disabled={bulkMutation.isPending}
          >
            Suppress
          </Button>
          <Button size="sm" variant="secondary"
            onClick={() => bulkMutation.mutate({ action: "delete", lead_ids: [...selectedIds] })}
            disabled={bulkMutation.isPending}
          >
            Delete
          </Button>
          <Button size="sm" variant="ghost" onClick={clearSelection}>Clear</Button>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size={24} />
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load leads"
          description="Make sure the backend is running and you are logged in."
        />
      ) : leads.length === 0 ? (
        <EmptyState
          title="No leads yet"
          description="Import a CSV file to get started, or create leads manually."
          action={
            <Button variant="primary" size="sm" onClick={openImportModal}>
              Import CSV
            </Button>
          }
        />
      ) : (
        <div
          className="rounded-lg overflow-hidden"
          style={{
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-ring)",
          }}
        >
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "var(--color-surface)",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <th className="px-3 py-2.5 w-8">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => allSelected ? clearSelection() : selectAll(leads.map((l) => l.id))}
                    className="rounded"
                  />
                </th>
                {["Status", "Score", "Source", "Temperature", "Added", "Next action"].map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="cursor-pointer transition-colors"
                  style={{
                    borderBottom: "1px solid var(--color-border)",
                    background: selectedIds.has(lead.id) ? "var(--color-border-warm)" : "white",
                  }}
                  onClick={() => openDrawer(lead.id)}
                  onMouseEnter={(e) => {
                    if (!selectedIds.has(lead.id))
                      (e.currentTarget as HTMLElement).style.background = "var(--color-surface)";
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedIds.has(lead.id))
                      (e.currentTarget as HTMLElement).style.background = "white";
                  }}
                >
                  <td
                    className="px-3 py-2.5"
                    onClick={(e) => { e.stopPropagation(); toggleSelect(lead.id); }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(lead.id)}
                      onChange={() => toggleSelect(lead.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td className="px-3 py-2.5">
                    {lead.score !== null ? (
                      <span
                        className="text-sm font-medium tabular-nums"
                        style={{
                          color: lead.score >= 70 ? "#166534" : lead.score >= 40 ? "#92400e" : "var(--color-text-secondary)",
                        }}
                      >
                        {lead.score}
                      </span>
                    ) : (
                      <span style={{ color: "var(--color-text-tertiary)" }}>—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    {lead.source ?? <span style={{ color: "var(--color-text-tertiary)" }}>—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-xs capitalize" style={{ color: "var(--color-text-secondary)" }}>
                    {lead.temperature}
                  </td>
                  <td className="px-3 py-2.5 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2.5 text-xs max-w-[160px] truncate" style={{ color: "var(--color-text-secondary)" }}>
                    {lead.next_action ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Load more */}
      {pagination?.has_more && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCursor(pagination.next_cursor)}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
