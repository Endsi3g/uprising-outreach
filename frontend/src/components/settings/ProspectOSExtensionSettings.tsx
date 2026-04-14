"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Search, MousePointer2, Settings2, Sparkles, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";

export function ProspectOSExtensionSettings() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [features, setFeatures] = useState({
    forms: true,
    extraction: true,
    floating: true,
    sync: true,
  });

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleFeature = (key: keyof typeof features) => {
    const newState = !features[key];
    setFeatures(prev => ({ ...prev, [key]: newState }));
    
    if (key === "sync") {
      setIsSyncing(newState);
      if (newState) showToast("Synchronisation du presse-papiers activée.");
      else showToast("Synchronisation du presse-papiers désactivée.");
    } else {
      showToast(`${newState ? 'Activé' : 'Désactivé'} : ${featureList.find(f => f.id === key)?.label}`);
    }
  };

  const featureList = [
    { 
      id: "forms", 
      label: "Saisie intelligente de formulaires", 
      icon: <MousePointer2 className="w-4 h-4" />,
      checked: features.forms
    },
    { 
      id: "extraction", 
      label: "Extraction LinkedIn & Google Maps", 
      icon: <Search className="w-4 h-4" />,
      checked: features.extraction
    },
    { 
      id: "floating", 
      label: "Bouton d'action flottant sur les sites web", 
      icon: <Sparkles className="w-4 h-4" />,
      checked: features.floating
    },
    { 
      id: "sync", 
      label: "Synchronisation du presse-papiers", 
      icon: <Share2 className="w-4 h-4" />,
      checked: features.sync
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-12 relative"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-12 left-1/2 z-50 px-6 py-3 rounded-2xl bg-zinc-900 text-white text-sm font-medium shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <section>
        <div className="flex items-center gap-3 mb-2">
          <Globe className="w-6 h-6 text-[#4285F4]" />
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif">ProspectOS Extension</h1>
            <Badge color="default" className="bg-[--color-surface] border-[--color-border-warm] text-[--color-text-tertiary] uppercase text-[9px] font-bold tracking-widest px-1.5 py-0.5">Beta</Badge>
          </div>
        </div>
        <p className="text-sm text-[--color-text-secondary] mb-8 leading-relaxed max-w-2xl">
          Intégrez l'intelligence de ProspectOS directement dans votre navigateur. Analysez les profils LinkedIn, enrichissez des leads depuis Google Maps et automatisez vos actions web en un clic.
        </p>

        <div className="p-8 rounded-3xl border border-[--color-border] bg-gradient-to-br from-[--color-surface] to-[--color-bg] flex items-center justify-between gap-12 overflow-hidden relative group">
          <div className="flex-1 space-y-5 z-10">
            <div className="flex items-center gap-2">
               <div className="relative w-2 h-2">
                 <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                 <div className="relative w-2 h-2 rounded-full bg-emerald-500" />
               </div>
               <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Extension Installée & Active</span>
            </div>
            <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <h3 className="text-2xl font-medium font-serif transition-colors group-hover:text-[--color-cta]">Version 2.4.1</h3>
                  {isSyncing && (
                    <motion.span 
                      animate={{ opacity: [0.4, 1, 0.4] }} 
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-[10px] font-bold text-[--color-cta] uppercase tracking-tighter"
                    >
                      • Syncing Live
                    </motion.span>
                  )}
                </div>
                <p className="text-sm text-[--color-text-tertiary] leading-relaxed max-w-sm">
                  Votre extension est à jour et synchronisée avec votre workspace "Uprising Outreach".
                </p>
            </div>
            <div className="pt-2 flex gap-3">
              <Button size="sm" variant="secondary" className="h-9 px-5 rounded-full text-xs font-bold border-[--color-border] hover:bg-white transition-all shadow-sm">Ouvrir le Store</Button>
              <Button 
                variant="secondary" 
                className="h-9 px-5 rounded-full text-xs font-bold border-[--color-border] hover:bg-white transition-all group/btn"
                onClick={() => {
                  showToast("Désactivation en cours...");
                }}
              >
                Désactiver
              </Button>
            </div>
          </div>
          
          <div className="w-56 h-48 rounded-2xl bg-white/40 border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-sm flex items-center justify-center p-6 transition-all hover:scale-[1.05] hover:rotate-1 duration-500 cursor-default">
            <div className="relative w-full h-full bg-white rounded-xl shadow-[0_12px_24px_rgba(0,0,0,0.06)] border border-zinc-100 p-2.5 overflow-hidden flex flex-col gap-1.5">
                {/* Mock browser UI */}
                <div className="h-2.5 w-full bg-zinc-50 rounded-full mb-1 flex items-center px-1">
                    <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-red-400/50" />
                        <div className="w-1 h-1 rounded-full bg-amber-400/50" />
                        <div className="w-1 h-1 rounded-full bg-emerald-400/50" />
                    </div>
                </div>
                <div className="flex gap-1.5 mb-2">
                    <div className="h-1.5 w-12 bg-zinc-50 rounded-full" />
                    <div className="h-1.5 w-6 bg-zinc-50 rounded-full" />
                </div>
                <div className="flex-1 bg-zinc-50/50 rounded-lg border border-zinc-50 p-2.5 flex flex-col gap-2 relative">
                    <div className="h-2 w-3/4 bg-zinc-100/80 rounded-full" />
                    <div className="h-1.5 w-1/2 bg-zinc-100/80 rounded-full" />
                    
                    <motion.div 
                      animate={isSyncing ? { y: [0, -2, 0] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="mt-auto flex items-center gap-2"
                    >
                      <div className="h-2 w-1/3 bg-zinc-100/80 rounded-full" />
                      {isSyncing && <div className="w-1.5 h-1.5 rounded-full bg-[--color-cta] animate-pulse" />}
                    </motion.div>

                    <div className="absolute top-2.5 right-2.5 group/orb">
                        <motion.div 
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-5 h-5 rounded-md bg-[#c96442] shadow-[0_0_12px_rgba(201,100,66,0.3)] flex items-center justify-center text-[10px] text-white cursor-help"
                        >
                          ✺
                        </motion.div>
                        <div className="absolute opacity-0 group-hover/orb:opacity-100 transition-opacity -top-8 -left-12 bg-zinc-800 text-white text-[9px] px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                          ProspectOS Live Active
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-[--color-border]" />

      <section className="space-y-8">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[--color-text-tertiary]">Fonctionnalités Activées</h2>
        
        <div className="grid grid-cols-1 gap-3 max-w-2xl">
          {featureList.map((f) => (
            <div 
              key={f.id} 
              className="flex items-center justify-between p-5 rounded-2xl border border-[--color-border] bg-[--color-surface] hover:border-[--color-border-warm] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-[--color-border] flex items-center justify-center text-[--color-text-secondary] group-hover:text-[--color-cta] transition-colors shadow-sm">
                  {f.icon}
                </div>
                <span className="text-sm font-medium text-[--color-text-secondary] group-hover:text-[--color-text] transition-colors">{f.label}</span>
              </div>
              <Switch 
                checked={f.checked} 
                onChange={() => toggleFeature(f.id as keyof typeof features)} 
              />
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
