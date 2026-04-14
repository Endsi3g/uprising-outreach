"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/shared/ThemeProvider";
import { apiClient } from "@/lib/api";
import type { SenderAccount } from "@/types/campaigns";

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
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab: SettingTab =
    tabParam === "Connecteurs" ? "connectors" : "general";
  const [activeTab, setActiveTab] = useState<SettingTab>(initialTab);

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
          {activeTab === "connectors" && <ConnecteursSettings key="connectors" searchParams={searchParams} />}
          {activeTab !== "general" && activeTab !== "connectors" && (
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

// ---------------------------------------------------------------------------
// Connecteurs tab
// ---------------------------------------------------------------------------

const PROVIDER_META = {
  gmail: { label: "Gmail", icon: "G", color: "#EA4335" },
  outlook: { label: "Outlook", icon: "O", color: "#0078D4" },
  smtp: { label: "SMTP", icon: "S", color: "#6B7280" },
} as const;

function ConnecteursSettings({ searchParams }: { searchParams: URLSearchParams }) {
  const [senders, setSenders] = useState<SenderAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; ok: boolean } | null>(null);

  const oauthStatus = searchParams.get("status");
  const oauthProvider = searchParams.get("provider");

  useEffect(() => {
    if (oauthStatus === "connected" && oauthProvider) {
      const meta = PROVIDER_META[oauthProvider as keyof typeof PROVIDER_META];
      setToast({ message: `${meta?.label ?? oauthProvider} connecté avec succès.`, ok: true });
    } else if (oauthStatus === "error") {
      setToast({ message: "La connexion a échoué. Veuillez réessayer.", ok: false });
    }
  }, [oauthStatus, oauthProvider]);

  useEffect(() => {
    apiClient
      .get<SenderAccount[]>("/senders")
      .then(setSenders)
      .catch(() => setSenders([]))
      .finally(() => setLoading(false));
  }, [oauthStatus]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  async function connectProvider(provider: "gmail" | "outlook") {
    setConnecting(provider);
    try {
      const { authorization_url } = await apiClient.get<{ authorization_url: string; provider: string }>(
        `/senders/oauth/${provider}/authorize`
      );
      window.location.href = authorization_url;
    } catch {
      setToast({ message: "Impossible d'initier la connexion OAuth.", ok: false });
      setConnecting(null);
    }
  }

  const statusBadge = (status: SenderAccount["status"]) => {
    const map = {
      active: { label: "Actif", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
      pending: { label: "En attente", cls: "text-amber-700 bg-amber-50 border-amber-200" },
      error: { label: "Erreur", cls: "text-red-700 bg-red-50 border-red-200" },
      paused: { label: "Pausé", cls: "text-[--color-text-secondary] bg-[--color-surface] border-[--color-border]" },
      disconnected: { label: "Déconnecté", cls: "text-[--color-text-tertiary] bg-[--color-surface] border-[--color-border]" },
    };
    const s = map[status] ?? map.pending;
    return (
      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider", s.cls)}>
        {s.label}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-10"
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={cn(
              "fixed top-6 right-6 z-50 px-5 py-3 rounded-xl border text-sm font-medium shadow-md",
              toast.ok
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            )}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h1 className="text-2xl font-serif mb-2">Connecteurs</h1>
        <p className="text-sm text-[--color-text-secondary]">
          Connectez vos boîtes mail pour envoyer et recevoir des messages depuis ProspectOS.
        </p>
      </div>

      {/* Connected accounts */}
      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-[--color-text-tertiary] mb-4">
          Comptes connectés
        </p>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-[--color-surface] border border-[--color-border] animate-pulse" />
            ))}
          </div>
        ) : senders.length === 0 ? (
          <div className="py-12 text-center rounded-xl border border-dashed border-[--color-border]">
            <p className="text-sm text-[--color-text-tertiary]">Aucun compte connecté.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {senders.map((sender) => {
              const meta = PROVIDER_META[sender.provider] ?? PROVIDER_META.smtp;
              return (
                <div
                  key={sender.id}
                  className="flex items-center gap-4 px-5 py-4 rounded-xl border border-[--color-border] bg-[--color-surface]"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: meta.color }}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{sender.email_address}</p>
                    <p className="text-xs text-[--color-text-tertiary]">{meta.label} · {sender.daily_send_limit} emails/jour</p>
                  </div>
                  {statusBadge(sender.status)}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add provider */}
      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-[--color-text-tertiary] mb-4">
          Ajouter un compte
        </p>
        <div className="grid grid-cols-2 gap-4">
          {(["gmail", "outlook"] as const).map((provider) => {
            const meta = PROVIDER_META[provider];
            const busy = connecting === provider;
            return (
              <button
                key={provider}
                onClick={() => connectProvider(provider)}
                disabled={!!connecting}
                className={cn(
                  "flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all text-left",
                  "border-[--color-border] bg-[--color-surface] hover:border-[--color-border-warm] hover:bg-[--color-surface-2]",
                  busy && "opacity-60 cursor-not-allowed"
                )}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: meta.color }}
                >
                  {meta.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{busy ? "Connexion…" : `Connecter ${meta.label}`}</p>
                  <p className="text-xs text-[--color-text-tertiary]">OAuth 2.0</p>
                </div>
              </button>
            );
          })}
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
