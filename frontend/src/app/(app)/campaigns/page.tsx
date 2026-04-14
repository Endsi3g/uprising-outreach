"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal, Button, Input } from "@/components/ui";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  type: "email" | "wait";
  title: string;
  delay?: string;
  template?: string;
}

export default function CampaignsPage() {
  const [campaignName, setCampaignName] = useState("SaaS Outreach Q2");
  const [isEditingName, setIsEditingName] = useState(false);
  const [steps, setSteps] = useState<Step[]>([
    { id: "1", type: "email", title: "Premier contact", template: "SaaS Outreach v1" },
    { id: "2", type: "wait", title: "Pause", delay: "2 jours" },
    { id: "3", type: "email", title: "Suivi de valeur", template: "Follow-up - Value prop" },
  ]);
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

  const addStep = (type: "email" | "wait") => {
    const newStep: Step = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: type === "email" ? "Nouvel Email" : "Nouvelle Attente",
      delay: type === "wait" ? "3 jours" : undefined,
      template: type === "email" ? "Template par défaut" : undefined,
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const updateStep = (id: string, updates: Partial<Step>) => {
    setSteps(steps.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  return (
    <div className="flex flex-col h-full bg-[--color-bg]">
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-3">
             {isEditingName ? (
               <div className="flex items-center gap-2">
                 <input
                   autoFocus
                   value={campaignName}
                   onChange={(e) => setCampaignName(e.target.value)}
                   onBlur={() => setIsEditingName(false)}
                   onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
                   className="text-2xl font-medium font-serif bg-transparent border-b border-[--color-cta] outline-none text-[--color-text]"
                 />
               </div>
             ) : (
               <h1 
                 onClick={() => setIsEditingName(true)}
                 className="text-2xl font-medium font-serif text-[--color-text] cursor-pointer hover:text-[--color-cta] transition-colors"
               >
                 {campaignName}
               </h1>
             )}
             <span className="text-xs px-2 py-0.5 rounded bg-[--color-surface-2] text-[--color-text-tertiary] font-medium">Draft</span>
           </div>
           <div className="flex gap-2">
              <Button variant="secondary" size="sm">Sauvegarder</Button>
              <Button variant="primary" size="sm" onClick={() => setIsLaunchModalOpen(true)}>Lancer la campagne</Button>
           </div>
        </div>
        <p className="text-sm text-[--color-text-secondary]">Créez des parcours automatisés pour vos prospects.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-32 custom-scrollbar">
        <div className="max-w-2xl mx-auto py-12">
          <LayoutGroup id="campaigns-sequence">
            <div className="relative">
              {/* Sequence start indicator */}
              <div className="flex justify-center mb-10">
                <motion.div 
                  layout
                  className="px-4 py-2 rounded-full bg-[--color-surface-2] border border-[--color-border] text-[10px] font-bold uppercase tracking-widest text-[--color-text-tertiary] flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Début de la séquence
                </motion.div>
              </div>

              <AnimatePresence mode="popLayout">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="relative"
                  >
                    {/* Vertical connector line */}
                    {index < steps.length && (
                      <div className="absolute left-1/2 -top-6 bottom-full w-px bg-[--color-border] -z-10 h-6" />
                    )}

                    <div className={cn(
                      "group relative rounded-2xl border p-6 transition-all duration-300",
                      step.type === "email" 
                        ? "bg-[--color-bg] border-[--color-border] shadow-sm hover:shadow-md" 
                        : "bg-[--color-surface] border-dashed border-[--color-border] hover:border-[--color-cta]/20"
                    )}>
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all",
                            step.type === "email" ? "bg-[--color-surface-2] text-[--color-cta]" : "bg-[--color-surface-white] text-[--color-text-tertiary] group-hover:bg-[--color-surface-2]"
                          )}>
                            {step.type === "email" ? "✉" : "⏳"}
                          </div>
                          <div>
                             <input 
                               value={step.title}
                               onChange={(e) => updateStep(step.id, { title: e.target.value })}
                               className="text-sm font-semibold text-[--color-text] bg-transparent outline-none border-b border-transparent hover:border-[--color-border] transition-colors"
                             />
                            <p className="text-[10px] text-[--color-text-tertiary] uppercase tracking-widest font-bold mt-0.5">
                              {step.type === "email" ? "Action: Envoi Email" : "Condition: Délai"}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeStep(step.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all text-[--color-text-tertiary]"
                        >
                          ✕
                        </button>
                      </div>

                      {step.type === "email" ? (
                        <div 
                          role="button"
                          tabIndex={0}
                          className="p-4 rounded-xl bg-[--color-surface] border border-[--color-border-subtle] flex items-center justify-between hover:bg-[--color-surface-2] transition-colors cursor-pointer group/inner"
                          onClick={() => setEditingTemplate(step.template || "")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setEditingTemplate(step.template || "");
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">📄</span>
                            <span className="text-sm font-medium text-[--color-text-secondary] group-hover/inner:text-[--color-text] transition-colors">
                              {step.template}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[--color-cta]">Éditer</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 px-1">
                          <span className="text-[11px] font-bold uppercase tracking-widest text-[--color-text-tertiary]">Attendre:</span>
                          <input 
                            type="text" 
                            value={step.delay} 
                            onChange={(e) => updateStep(step.id, { delay: e.target.value })}
                            className="bg-transparent text-sm font-semibold text-[--color-text] outline-none border-b border-[--color-border] w-24 text-center focus:border-[--color-cta]"
                          />
                        </div>
                      )}
                    </div>

                    {/* Vertical connector line (small) */}
                    <div className="flex justify-center py-3">
                      <div className="w-px h-6 bg-[--color-border]" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add Step Cluster */}
              <motion.div 
                layout
                className="flex items-center justify-center gap-4 mt-4"
              >
                <motion.button 
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addStep("email")}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[--color-surface] border border-[--color-border] text-xs font-bold uppercase tracking-widest text-[--color-text-secondary] hover:text-[--color-cta] hover:border-[--color-cta] hover:bg-white transition-all shadow-sm"
                >
                  <span className="text-lg">+</span> Email
                </motion.button>
                <motion.button 
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addStep("wait")}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[--color-surface] border border-[--color-border] text-xs font-bold uppercase tracking-widest text-[--color-text-secondary] hover:text-[--color-text] hover:bg-white transition-all shadow-sm"
                >
                  <span className="text-lg">+</span> Attente
                </motion.button>
              </motion.div>
            </div>
          </LayoutGroup>
        </div>
      </div>

      <Modal open={isLaunchModalOpen} onClose={() => setIsLaunchModalOpen(false)} title="Lancer la campagne">
        <div className="pt-2 pb-4 space-y-4">
          <p className="text-sm text-[--color-text-secondary]">Êtes-vous sûr de vouloir lancer la campagne <strong>{campaignName}</strong> ? Les emails seront planifiés immédiatement pour les prospects actifs.</p>
          <div className="flex gap-3 pt-4 border-t border-[--color-border]">
            <Button variant="secondary" className="flex-1" onClick={() => setIsLaunchModalOpen(false)}>Annuler</Button>
            <Button variant="primary" className="flex-1" onClick={() => { setIsLaunchModalOpen(false); alert("Campagne lancée !"); }}>Confirmer le lancement</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!editingTemplate} onClose={() => setEditingTemplate(null)} title="Éditeur de template">
        <div className="pt-4 pb-2">
          <p className="text-sm text-[--color-text-secondary] mb-4">Édition du template : <strong>{editingTemplate}</strong></p>
          <RichTextEditor 
            value="<p>Bonjour {{first_name}},</p><p>J'ai remarqué votre entreprise sur Montréal...</p>" 
            onChange={(val) => console.log('Template Update:', val)} 
          />
          <div className="flex justify-end mt-4">
            <Button variant="primary" onClick={() => setEditingTemplate(null)}>Sauvegarder</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
