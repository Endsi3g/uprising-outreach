"use client";

import { useLeadsStore } from "@/store/leads";
import { LeadStatusBadge } from "@/components/ui";
import { Spinner } from "@/components/ui/Spinner";
import type { Lead } from "@/types/leads";
import { cn } from "@/lib/utils";

interface LeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
  onRowClick: (id: string) => void;
  selectedId: string | null;
}

export default function LeadsTable({ 
  leads, 
  isLoading, 
  onRowClick, 
  selectedId 
}: LeadsTableProps) {
  const { selectedIds, toggleSelect, selectAll, clearSelection } = useLeadsStore();
  const allSelected = leads.length > 0 && leads.every((l) => selectedIds.has(l.id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-[--color-border] rounded-2xl">
        <p className="text-[--color-text-tertiary] font-serif italic">Aucun lead trouvé.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-[--color-border] bg-[--color-bg] shadow-[--shadow-ring]">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-[--color-surface] border-b border-[--color-border]">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => allSelected ? clearSelection() : selectAll(leads.map((l) => l.id))}
                  className="rounded border-[--color-border] bg-transparent cursor-pointer"
                />
              </th>
              {["Lead", "Status", "Source", "Ajouté"].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[--color-text-tertiary]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[--color-border]">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => onRowClick(lead.id)}
                className={cn(
                  "cursor-pointer transition-all duration-200",
                  selectedId === lead.id ? "bg-[--color-surface-2]" : "hover:bg-[--color-surface]"
                )}
              >
                <td className="px-4 py-4" onClick={(e) => { e.stopPropagation(); toggleSelect(lead.id); }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(lead.id)}
                    onChange={() => {}}
                    className="rounded border-[--color-border] bg-transparent cursor-pointer"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[--color-surface-2] flex items-center justify-center font-medium text-[--color-text-secondary] text-xs">
                      {lead.first_name?.[0] || lead.last_name?.[0] || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[--color-text] truncate">
                        {lead.first_name || lead.last_name ? `${lead.first_name ?? ""} ${lead.last_name ?? ""}`.strip() : "Prospect inconnu"}
                      </p>
                      <p className="text-xs text-[--color-text-tertiary] truncate">{lead.company_name || "Entreprise inconnue"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <LeadStatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-4 text-[--color-text-secondary]">
                   {lead.source ?? "Direct"}
                </td>
                <td className="px-4 py-4 text-xs text-[--color-text-tertiary]">
                   {new Date(lead.created_at).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
