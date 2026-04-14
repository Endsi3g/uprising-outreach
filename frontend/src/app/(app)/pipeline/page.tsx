"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";

type OpportunityStage = "new_reply" | "interested" | "qualified" | "meeting_booked" | "proposal_sent" | "won" | "lost";

interface Opportunity {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: OpportunityStage;
  probability: number;
}

const STAGES: { key: OpportunityStage; label: string; accent: string }[] = [
  { key: "new_reply", label: "Nouveaux", accent: "#60a5fa" },
  { key: "interested", label: "Intéressés", accent: "#a78bfa" },
  { key: "qualified", label: "Qualifiés", accent: "#fbbf24" },
  { key: "meeting_booked", label: "RDV Fixé", accent: "#34d399" },
  { key: "proposal_sent", label: "Proposition", accent: "#c96442" },
  { key: "won", label: "Gagné", accent: "#4ade80" },
];

const INITIAL_OPPORTUNITIES: Opportunity[] = [
  { id: "1", name: "Luc Richard", company: "Tech Solutions", value: 1200, stage: "new_reply", probability: 20 },
  { id: "2", name: "Sarah Levy", company: "Corp.FR", value: 3500, stage: "interested", probability: 40 },
  { id: "3", name: "Marc Ouellet", company: "Construction MTL", value: 2400, stage: "qualified", probability: 60 },
  { id: "4", name: "Yves Tremblay", company: "Plomberie Pro", value: 4500, stage: "meeting_booked", probability: 80 },
  { id: "5", name: "Jean Dupont", company: "Boulangerie Co", value: 800, stage: "new_reply", probability: 10 },
];

export default function PipelinePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(INITIAL_OPPORTUNITIES);

  const moveOpportunity = (id: string, newStage: OpportunityStage) => {
    setOpportunities(prev => prev.map(opp => {
      if (opp.id === id) {
        // Adjust probability based on stage
        const stageIndex = STAGES.findIndex(s => s.key === newStage);
        const newProb = Math.min(100, Math.max(10, (stageIndex + 1) * 15 + (Math.random() * 10)));
        return { ...opp, stage: newStage, probability: Math.round(newProb) };
      }
      return opp;
    }));
  };

  const totalValue = useMemo(() => 
    opportunities
      .filter((o) => o.stage !== "lost" && o.stage !== "won")
      .reduce((sum, o) => sum + o.value, 0)
  , [opportunities]);

  return (
    <div className="flex flex-col h-full bg-[--color-bg]">
      <div className="px-10 pt-10 pb-6">
        <PageHeader
          title="Pipeline"
          description={`${opportunities.length} opportunités actives · $${totalValue.toLocaleString()} valeur pondérée`}
        />
        
        {/* Quick legend / Summary */}
        <div className="mt-4 flex gap-8">
           <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[--color-text-tertiary] mb-1">Total Opportunités</span>
              <span className="text-xl font-serif font-medium text-[--color-text]">{opportunities.filter(o => o.stage !== 'won').length}</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[--color-text-tertiary] mb-1">Gagné (Mois)</span>
              <span className="text-xl font-serif font-medium text-green-500">$12,400</span>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar select-none">
        <LayoutGroup id="pipeline-board">
          <div className="flex gap-6 h-full px-10 pb-10 min-w-max">
            {STAGES.map((stage) => {
              const cards = opportunities.filter((o) => o.stage === stage.key);
              
              return (
                <div key={stage.key} className="flex flex-col w-[280px] flex-shrink-0">
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-5 px-1">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]" style={{ background: stage.accent }} />
                      <span className="text-xs font-bold uppercase tracking-widest text-[--color-text-tertiary]">{stage.label}</span>
                    </div>
                    <span className="text-[11px] font-bold tabular-nums text-[--color-text-tertiary] bg-[--color-surface] border border-[--color-border] px-2.5 py-0.5 rounded-full shadow-sm">
                      {cards.length}
                    </span>
                  </div>

                  {/* Column Body */}
                  <div
                    className={cn(
                      "flex-1 rounded-[24px] p-4 space-y-4 transition-all duration-300",
                      "bg-[--color-surface] border border-[--color-border] relative group/col shadow-inner"
                    )}
                  >
                    {cards.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-[--color-border] rounded-2xl text-[--color-text-tertiary] text-xs font-serif italic text-center px-4">
                        Aucun prospect à ce stade.<br/><span className="mt-2 block opacity-50">Cliquez sur une carte pour la déplacer.</span>
                      </div>
                    ) : (
                      <AnimatePresence mode="popLayout">
                        {cards.map((opp) => (
                          <motion.div
                            key={opp.id}
                            layoutId={opp.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            whileHover={{ y: -4, boxShadow: "0 12px 24px -10px rgba(0,0,0,0.1)" }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              const currentIndex = STAGES.findIndex(s => s.key === stage.key);
                              const nextIndex = (currentIndex + 1) % STAGES.length;
                              moveOpportunity(opp.id, STAGES[nextIndex].key);
                            }}
                            className="p-5 rounded-2xl cursor-pointer bg-white border border-[--color-border] shadow-sm group/card transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[--color-text-tertiary]">
                                {opp.company}
                              </span>
                              <span className="text-[12px] font-bold text-[--color-cta]">
                                ${opp.value.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[15px] font-medium text-[--color-text] mb-5 tracking-tight">{opp.name}</p>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[--color-text-tertiary]">
                                <span>Probabilité</span>
                                <span className="text-[--color-text]">{opp.probability}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-[--color-surface-2] overflow-hidden p-0.5">
                                <motion.div 
                                  layout
                                  initial={{ width: 0 }}
                                  animate={{ width: `${opp.probability}%` }}
                                  transition={{ type: "spring", bounce: 0, duration: 0.6 }}
                                  className="h-full rounded-full" 
                                  style={{ background: stage.accent }} 
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </LayoutGroup>
      </div>
    </div>
  );
}
