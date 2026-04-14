"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/shared/ThemeProvider";

type SettingTab = 
  | "general" 
  | "account" 
  | "privacy" 
  | "billing" 
  | "usage" 
  | "caps" 
  | "connectors" 
  | "claude_code" 
  | "claude_chrome";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingTab>("general");

  const TABS = [
    { key: "general" as const, label: "Général" },
    { key: "account" as const, label: "Compte" },
    { key: "privacy" as const, label: "Confidentialité" },
    { key: "billing" as const, label: "Facturation" },
    { key: "usage" as const, label: "Utilisation" },
    { key: "caps" as const, label: "Capacités" },
    { key: "connectors" as const, label: "Connecteurs" },
    { key: "claude_code" as const, label: "Claude Code" },
    { key: "claude_chrome" as const, label: "Claude dans Chrome", beta: true },
  ];

  return (
    <div className="flex h-full bg-[--color-bg] overflow-hidden">
      {/* Settings Navigation */}
      <aside className="w-[240px] border-r border-[--color-border] px-4 py-8 flex flex-col gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
              activeTab === tab.key 
                ? "bg-[--color-surface-2] text-[--color-text] font-medium" 
                : "text-[--color-text-secondary] hover:bg-[--color-surface] hover:text-[--color-text]"
            )}
          >
            {tab.label}
            {tab.beta && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[--color-surface] border border-[--color-border-warm] text-[--color-text-tertiary] font-bold uppercase tracking-wider">
                Beta
              </span>
            )}
          </button>
        ))}
      </aside>

      {/* Settings Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-12 py-12 max-w-4xl">
        <AnimatePresence mode="wait">
          {activeTab === "general" && <GeneralSettings key="general" />}
          {activeTab !== "general" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-20 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[--color-surface] border border-[--color-border] flex items-center justify-center mx-auto mb-6 text-xl">
                 ⚙️
              </div>
              <h2 className="text-xl font-serif mb-2">Section {activeTab}</h2>
              <p className="text-sm text-[--color-text-secondary] max-w-sm mx-auto">
                Ceci est un template pour les autres sections de réglages. La logique de l'interface reste cohérente à travers toute l'application.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function GeneralSettings() {
  const { theme, setTheme } = useTheme() as any;
  const [animation, setAnimation] = useState("auto");
  const [font, setFont] = useState("default");
  const [vocal, setVocal] = useState("buttery");

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-12"
    >
      <section>
        <h1 className="text-2xl font-serif mb-8">Apparence</h1>
        
        <div className="space-y-8">
          {/* Mode de couleur */}
          <div>
            <p className="text-sm font-medium mb-4 text-[--color-text-secondary]">Mode de couleur</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: "light", label: "Simplifiée", preview: "bg-[#FAFAFA]" },
                { id: "auto", label: "Auto", preview: "bg-gradient-to-r from-[#FAFAFA] to-[#141413]" },
                { id: "dark", label: "Sombre", preview: "bg-[#141413]" }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setTheme(m.id as any)}
                  className={cn(
                    "group flex flex-col gap-3 transition-all",
                    theme === m.id ? "opacity-100" : "opacity-60 hover:opacity-80"
                  )}
                >
                  <div className={cn(
                    "w-full aspect-[4/3] rounded-xl border-2 transition-all flex flex-col p-2 gap-1.5",
                    theme === m.id ? "border-[--color-cta] shadow-sm" : "border-[--color-border] bg-[--color-surface]"
                  )}>
                     {/* Mini UI Preview */}
                     <div className={cn("h-4 w-full rounded-sm", m.id === 'dark' ? 'bg-white/10' : 'bg-black/10')} />
                     <div className="flex gap-1.5">
                       <div className={cn("h-3 w-3/4 rounded-sm", m.id === 'dark' ? 'bg-white/10' : 'bg-black/10')} />
                       <div className={cn("h-3 w-1/4 rounded-sm", m.id === 'dark' ? 'bg-white/10' : 'bg-black/10')} />
                     </div>
                     <div className="mt-auto flex justify-between items-center">
                        <div className={cn("h-3 w-10 rounded-sm", m.id === 'dark' ? 'bg-white/10' : 'bg-black/10')} />
                        <div className="w-2 h-2 rounded-full" style={{ background: theme === m.id ? 'var(--color-cta)' : 'var(--color-border-warm)' }} />
                     </div>
                  </div>
                  <span className="text-xs font-medium text-center">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Animation d'arrière-plan */}
          <div>
            <p className="text-sm font-medium mb-4 text-[--color-text-secondary]">Animation d'arrière-plan</p>
            <div className="flex gap-2 p-1 rounded-xl bg-[--color-surface] border border-[--color-border] w-fit">
              {["Activé", "Auto", "Désactivé"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAnimation(opt.toLowerCase())}
                  className={cn(
                    "px-6 py-2 rounded-lg text-xs font-medium transition-all",
                    animation === opt.toLowerCase() 
                      ? "bg-[--color-surface-white] text-[--color-text] shadow-sm shadow-black/5 border border-[--color-border]" 
                      : "text-[--color-text-tertiary] hover:text-[--color-text-secondary]"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Police de discussion */}
          <div>
            <p className="text-sm font-medium mb-4 text-[--color-text-secondary]">Police de discussion</p>
            <div className="grid grid-cols-4 gap-4">
              {[
                { id: "default", label: "Par défaut", font: "font-serif" },
                { id: "sans", label: "Sans", font: "font-sans" },
                { id: "system", label: "Système", font: "font-sans" },
                { id: "dyslexic", label: "Adapté aux dyslexiques", font: "font-sans" }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFont(f.id)}
                  className={cn(
                    "flex flex-col gap-3 p-4 rounded-xl border-2 transition-all text-left",
                    font === f.id ? "border-[--color-cta] bg-[--color-surface-2]" : "border-[--color-border] bg-[--color-surface] hover:bg-[--color-surface-2]/50"
                  )}
                >
                  <span className={cn("text-2xl", f.font)}>Aa</span>
                  <span className="text-[10px] font-medium leading-relaxed uppercase tracking-widest text-[--color-text-tertiary]">{f.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-[--color-border]" />

      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-[--color-text-secondary] mb-6">Paramètres vocaux</h2>
        <div className="flex flex-wrap gap-2">
          {["Buttery", "Airy", "Mellow", "Glassy", "Rounded"].map((v) => (
            <button
               key={v}
               onClick={() => setVocal(v.toLowerCase())}
               className={cn(
                 "px-6 py-3 rounded-xl text-sm font-medium border-2 transition-all",
                 vocal === v.toLowerCase() 
                  ? "border-[--color-cta] bg-[--color-surface-2] text-[--color-text]" 
                  : "border-[--color-border] bg-[--color-surface] text-[--color-text-secondary] hover:border-[--color-border-warm]"
               )}
            >
              {v}
            </button>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
