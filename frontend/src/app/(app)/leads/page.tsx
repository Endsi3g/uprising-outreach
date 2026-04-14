"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Button, Badge } from "@/components/ui";
import LeadsTable from "@/components/leads/LeadsTable";
import { motion, AnimatePresence } from "framer-motion";
import { useLeadsStore } from "@/store/leads";
import type { Lead, Page } from "@/types/leads";
import { cn } from "@/lib/utils";
import { Sparkles, Mail, UserPlus, Zap } from "lucide-react";
import { useAIChat } from "@/store/useAIChat";

const STATUS_FILTERS = [
  { id: "all", label: "Tous", count: 120 },
  { id: "raw", label: "Bruts", count: 45 },
  { id: "enriched", label: "Enrichis", count: 32 },
  { id: "scored", label: "Scoring IA", count: 18 },
  { id: "replied", label: "Réponses", count: 5 },
];

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  
  const { selectedIds, clearSelection } = useLeadsStore();

  const { data, isLoading } = useQuery<Page<Lead>>({
    queryKey: ["leads", search, filter],
    queryFn: () => {
      let url = `/leads?q=${search}`;
      if (filter !== "all") url += `&status=${filter}`;
      return apiClient.get<Page<Lead>>(url);
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: (action: string) => 
      apiClient.post("/leads/bulk", {
        action,
        lead_ids: Array.from(selectedIds),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      clearSelection();
    }
  });

  const deepAuditMutation = useMutation({
    mutationFn: (leadId: string) => 
      apiClient.post(`/ai/run-nanoclaw`, {
        prompt: `Effectue une analyse profonde pour le prospect ${leadId}. Analyse le site web, les signaux de marché et propose une stratégie de personnalisation ultra-ciblée.`,
        group_id: "leads_audit"
      }),
    onSuccess: () => {
      // Show toast or notification
    }
  });

  const leads = data?.data ?? [];
  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  return (
    <div className="flex h-full overflow-hidden relative bg-[--color-bg]">
      <div className="flex-1 p-8 lg:p-10 overflow-auto custom-scrollbar">
        <PageHeader
          title="Prospects"
          description="Gérez votre base de données de leads et lancez des actions d'intelligence."
          actions={
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">Exporter</Button>
              <Button variant="primary" size="sm">Importer des leads</Button>
            </div>
          }
        />

        {/* Status Bar */}
        <div className="flex items-center gap-6 mb-8 border-b border-[--color-border] overflow-x-auto no-scrollbar">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={cn(
                "pb-3 text-sm font-medium transition-all relative whitespace-nowrap",
                filter === s.id ? "text-[--color-text]" : "text-[--color-text-tertiary] hover:text-[--color-text-secondary]"
              )}
            >
              <span className="flex items-center gap-2">
                {s.label}
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full",
                  filter === s.id ? "bg-[--color-surface-2] text-[--color-cta]" : "bg-[--color-surface] text-[--color-text-tertiary]"
                )}>
                  {s.count}
                </span>
              </span>
              {filter === s.id && (
                <motion.div 
                  layoutId="active-filter"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[--color-cta]" 
                />
              )}
            </button>
          ))}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="w-full max-w-sm">
            <Input
              placeholder="Rechercher un prospect..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[--color-bg]"
            />
          </div>
          
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2"
              >
                <span className="text-xs font-semibold mr-2 text-[--color-text-secondary]">
                  {selectedIds.size} sélectionnés
                </span>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => bulkActionMutation.mutate("enrich")}
                  disabled={bulkActionMutation.isPending}
                >
                  {bulkActionMutation.isPending && bulkActionMutation.variables === "enrich" ? "..." : "Enrichir"}
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => bulkActionMutation.mutate("score")}
                  disabled={bulkActionMutation.isPending}
                >
                  {bulkActionMutation.isPending && bulkActionMutation.variables === "score" ? "..." : "Scoring IA"}
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => bulkActionMutation.mutate("suppress")}
                  className="text-red-500 hover:text-red-600"
                >
                  Supprimer
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <LeadsTable 
          leads={leads} 
          isLoading={isLoading} 
          onRowClick={(id) => setSelectedLeadId(id)}
          selectedId={selectedLeadId}
        />
      </div>

      {/* Slide-out Drawer */}
      <AnimatePresence>
        {selectedLeadId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLeadId(null)}
              className="absolute inset-0 bg-black/10 z-20 backdrop-blur-[2px]"
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-[--color-bg] border-l border-[--color-border] shadow-2xl z-30 flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-[--color-border]">
                <h2 className="text-xl font-medium font-serif text-[--color-text]">
                  Fiche Prospect
                </h2>
                <button 
                  onClick={() => setSelectedLeadId(null)}
                  className="p-2 hover:bg-[--color-surface] rounded-lg transition-colors text-[--color-text-tertiary]"
                >
                  ✕
                </button>
              </div>

              {selectedLead ? (
                <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-[--color-surface] border border-[--color-border] flex items-center justify-center text-2xl font-semibold shadow-sm text-[--color-cta]">
                      {(selectedLead as any).full_name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="text-2xl font-serif font-medium text-[--color-text]">{(selectedLead as any).full_name || "Prospect inconnu"}</p>
                      <p className="text-sm text-[--color-text-secondary] mt-1">{(selectedLead as any).title || "Contact"} @ <span className="text-[--color-cta] font-medium">{(selectedLead as any).company_name || "Entreprise"}</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[--color-text-tertiary] mb-2">COORDONNÉES</p>
                      <p className="text-sm font-medium text-[--color-text]">{(selectedLead as any).email || "Email non renseigné"}</p>
                      <p className="text-xs text-[--color-text-tertiary] mt-1">Sourcing: {selectedLead.source || "Direct"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[--color-text-tertiary] mb-2">STATUS ET SCORE</p>
                      <div className="flex items-center gap-2">
                         <Badge color="terracotta">{selectedLead.status}</Badge>
                         {selectedLead.score !== null && (
                            <span className="text-sm font-bold text-[--color-cta]">{selectedLead.score}/100</span>
                         )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-[--color-border] space-y-4">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-[--color-text-tertiary]">INTELLIGENCE IA</p>
                     <div className="p-6 rounded-2xl bg-[--color-surface] border border-[--color-border] text-sm leading-relaxed text-[--color-text-secondary] italic font-serif">
                       {selectedLead.notes || "Pas encore d'analyse IA disponible pour ce prospect. Utilisez 'Scoring IA' pour lancer l'enrichissement sémantique."}
                     </div>
                  </div>

                  <div className="pt-8 flex flex-col gap-3">
                    <Button 
                      variant="primary" 
                      onClick={() => deepAuditMutation.mutate(selectedLead.id)}
                      disabled={deepAuditMutation.isPending}
                      className="w-full relative overflow-hidden group/audit"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-purple-400/20 opacity-0 group-hover/audit:opacity-100 transition-opacity" />
                      <div className="flex items-center justify-center gap-2">
                        {deepAuditMutation.isPending ? (
                          <Zap className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-orange-400" />
                        )}
                        <span>{deepAuditMutation.isPending ? "Analyse en cours..." : "Analyse Profonde (NanoClaw)"}</span>
                      </div>
                    </Button>
                    <div className="flex gap-3">
                      <Button variant="secondary" className="flex-1 flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4" />
                        Écrire
                      </Button>
                      <Button variant="secondary" className="flex-1 flex items-center justify-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Assigner
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-20 text-center animate-pulse text-[--color-text-tertiary]">Chargement...</div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
