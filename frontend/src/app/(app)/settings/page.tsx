"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/shared/ThemeProvider";
import { useCurrentUser } from "@/hooks/useCurrentUser";

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
    { key: "claude_code" as const, label: "ProspectOS Code" },
    { key: "claude_chrome" as const, label: "ProspectOS dans Chrome", beta: true },
  ];

  return (
    <div className="flex h-full bg-[--color-bg] overflow-hidden">
      {/* Settings Navigation */}
      <aside className="w-[240px] border-r border-[--color-border] px-4 py-8 flex flex-col gap-1">
        <h2 className="text-[20px] font-serif px-3 mb-6">Paramètres</h2>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left",
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
      <main className="flex-1 overflow-y-auto custom-scrollbar px-12 py-12">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "general" && <GeneralSettings key="general" />}
            {activeTab === "account" && <AccountSettings key="account" />}
            {activeTab === "privacy" && <PrivacySettings key="privacy" />}
            {activeTab === "usage" && <UsageSettings key="usage" />}
            {!["general", "account", "privacy", "usage"].includes(activeTab) && (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-20 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-[--color-surface] border border-[--color-border] flex items-center justify-center mx-auto mb-6 text-xl">
                   ⚙️
                </div>
                <h2 className="text-xl font-serif mb-2">Section {activeTab}</h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function AccountSettings() {
  const { data: user } = useCurrentUser();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <section>
        <h2 className="text-xl font-serif mb-6">Profil</h2>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-[--color-text-secondary]">Nom complet</label>
            <div className="bg-[--color-surface] border border-[--color-border] rounded-xl px-4 py-2.5 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[--color-border-warm] flex items-center justify-center text-[10px]">
                {user?.first_name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <input type="text" defaultValue={user?.first_name ?? ""} className="bg-transparent outline-none w-full text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-[--color-text-secondary]">Comment souhaitez-vous que ProspectOS vous appelle ? *</label>
            <input type="text" defaultValue={user?.first_name ?? ""} className="w-full bg-[--color-surface] border border-[--color-border] rounded-xl px-4 py-2.5 outline-none text-sm" />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-medium text-[--color-text-secondary]">Quelle est la meilleure description de votre travail ?</label>
          <select className="w-full bg-[--color-surface] border border-[--color-border] rounded-xl px-4 py-2.5 outline-none text-sm appearance-none">
            <option>Autre</option>
          </select>
        </div>
      </section>

      <section>
        <label className="text-xs font-medium text-[--color-text-secondary] block mb-2">Quelles préférences personnelles ProspectOS doit-il prendre en compte dans ses réponses ?</label>
        <textarea 
          className="w-full h-80 bg-[--color-surface] border border-[--color-border] rounded-xl p-6 outline-none text-[14px] font-sans leading-relaxed custom-scrollbar"
          defaultValue={`# Rôle
Vous êtes le cofondateur virtuel d'Uprising Studio, une agence de marketing digital spécialisée en création de contenu, sites web et systèmes AI pour PME. Vous possédez une expertise en entrepreneuriat digital, gestion d'agence et stratégie commerciale. Vous n'êtes pas un assistant qui acquiesce - vous êtes un partenaire égal qui challenge les idées, propose des alternatives, et pousse vers l'excellence. Votre loyauté va à la réussite d'Uprising Studio, même si cela signifie contredire les décisions proposées.

# Tâche
Agir comme cofondateur stratégique d'Uprising Studio en fournissant conseil concis, analyse critique et support opérationnel. Vous devez aider à optimiser les processus de production, évaluer les partenariats, définir le pricing, améliorer le cold outreach, résoudre les problèmes opérationnels et scaler l'agence. Restez bref par défaut, mais approfondissez quand la complexité l'exige.

# Contexte
Uprising Studio a besoin d'un partenaire de réflexion stratégique qui apporte une perspective objective et un challenge constructif. Dans l'entrepreneuriat digital, les fondateurs peuvent s'attacher émotionnellement à des approches sous-optimales ou manquer de recul. Un véritable cofondateur questionne, propose, débat et co-crée pour maximiser les chances de succès de l'agence.`}
        />
      </section>
    </motion.div>
  );
}

function PrivacySettings() {
  const Toggle = ({ checked }: { checked: boolean }) => (
    <div className={cn("w-10 h-5 rounded-full relative transition-colors", checked ? "bg-[--color-cta]" : "bg-[--color-border-warm]")}>
      <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm", checked ? "left-[22px]" : "left-0.5")} />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 border border-[--color-border] rounded-xl bg-[--color-surface]">🛡️</div>
          <div>
            <h2 className="text-xl font-serif">Confidentialité</h2>
            <p className="text-xs text-[--color-text-secondary]">Anthropic s'engage pour la transparence des pratiques en matière de données</p>
          </div>
        </div>
        <div className="space-y-4 pt-4 border-t border-[--color-border]">
          <button className="w-full text-left text-sm py-1 flex items-center justify-between hover:text-[--color-text] text-[--color-text-secondary]">Comment nous protégeons vos données <span>›</span></button>
          <button className="w-full text-left text-sm py-1 flex items-center justify-between hover:text-[--color-text] text-[--color-text-secondary]">Comment nous utilisons vos données <span>›</span></button>
        </div>
      </section>

      <section className="space-y-6 pt-6 border-t border-[--color-border]">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[--color-text-tertiary]">Paramètres de confidentialité</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Exporter les données</p>
          </div>
          <button className="px-4 py-2 rounded-xl bg-[--color-surface] border border-[--color-border] text-sm font-medium">Exporter les données</button>
        </div>

        <div className="flex items-center justify-between border-t border-[--color-border] pt-4">
          <p className="text-sm font-medium">Conversations partagées</p>
          <button className="px-5 py-2 rounded-xl bg-[--color-surface] border border-[--color-border] text-sm font-medium">Gérer</button>
        </div>

        <div className="flex items-center justify-between border-t border-[--color-border] pt-4">
          <p className="text-sm font-medium">Préférences de mémoire</p>
          <button className="px-5 py-2 rounded-xl bg-[--color-surface] border border-[--color-border] text-sm font-medium">Gérer ↗</button>
        </div>

        <div className="flex items-center justify-between border-t border-[--color-border] pt-4">
          <div>
            <p className="text-sm font-medium">Métadonnées de localisation</p>
            <p className="text-xs text-[--color-text-tertiary] mt-1">Autoriser ProspectOS à utiliser les métadonnées de localisation approximative (ville/région) pour améliorer les expériences produit.</p>
          </div>
          <Toggle checked={true} />
        </div>

        <div className="flex items-center justify-between border-t border-[--color-border] pt-4">
          <div>
            <p className="text-sm font-medium">Aider à améliorer l'IA</p>
            <p className="text-xs text-[--color-text-tertiary] mt-1">Autoriser l'utilisation de vos conversations et sessions de programmation pour entraîner et améliorer les modèles d'IA de ProspectOS.</p>
          </div>
          <Toggle checked={true} />
        </div>
      </section>
    </motion.div>
  );
}

function UsageSettings() {
  const ProgressBar = ({ percent, label }: { percent: number; label: string }) => (
    <div className="space-y-3">
      <div className="flex justify-between text-xs font-medium text-[--color-text-secondary]">
        <span>{label}</span>
        <span>{percent}% utilisés</span>
      </div>
      <div className="h-1.5 w-full bg-[--color-surface-2] rounded-full overflow-hidden">
        <div className="h-full bg-[--color-cta]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[--color-text-tertiary]">Limites d'utilisation du forfait</h2>
          <span className="text-xs font-medium text-[--color-text-tertiary]">Pro</span>
        </div>
        <div className="space-y-1">
          <ProgressBar percent={100} label="Session actuelle" />
          <p className="text-[11px] text-[--color-text-tertiary] text-right">Réinitialisation dans 2 h 53 min</p>
        </div>
      </section>

      <section className="space-y-8 border-t border-[--color-border] pt-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[--color-text-tertiary]">Limites hebdomadaires</h2>
        <div className="space-y-1">
          <ProgressBar percent={84} label="Tous les modèles" />
          <p className="text-[11px] text-[--color-text-tertiary] text-right">Réinitialisation sam. 18:00</p>
        </div>
      </section>

      <section className="space-y-8 border-t border-[--color-border] pt-8">
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-sm font-bold uppercase tracking-widest text-[--color-text-tertiary]">Usage supplémentaire</h2>
           <div className="w-8 h-4 bg-[--color-surface-2] border border-[--color-border] rounded-full relative">
             <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
           </div>
        </div>
        <p className="text-xs text-[--color-text-tertiary]">Activez l'utilisation supplémentaire pour continuer à utiliser l'IA si vous atteignez une limite.</p>
        
        <div className="grid grid-cols-2 gap-8 items-center border-t border-[--color-border] pt-6">
           <div>
             <p className="text-sm font-medium">0,00 $CA dépensé</p>
             <p className="text-[11px] text-[--color-text-tertiary] mt-1">Renouvellement le May 1</p>
           </div>
           <div className="h-1 w-full bg-[--color-surface-2] rounded-full">
             <div className="h-full bg-[--color-text-tertiary] w-[5%]" />
           </div>
        </div>

        <div className="flex items-center justify-between border-t border-[--color-border] pt-6">
           <div>
             <p className="text-sm font-medium">10 $CA</p>
             <p className="text-[11px] text-[--color-text-tertiary] mt-1">Limite de dépenses mensuelle</p>
           </div>
           <button className="px-4 py-2 bg-[--color-surface] border border-[--color-border] rounded-xl text-xs font-medium">Ajuster la limite</button>
        </div>
      </section>
    </motion.div>
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
