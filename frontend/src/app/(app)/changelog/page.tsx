"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, Shield, Rocket, Bug, Terminal, Cpu, Monitor, Volume2 } from "lucide-react";

const CHANGELOG = [
  {
    version: "1.2.0",
    date: "14 Avril 2026",
    title: "Agents Autonomes & Voix Dynamic",
    items: [
      {
        type: "feat",
        label: "Intégration NanoClaw",
        description: "Connecté au framework NanoClaw pour l'exécution d'agents autonomes dans des containers isolés.",
        icon: <Cpu className="w-4 h-4 text-amber-400" />
      },
      {
        type: "feat",
        label: "Sélecteur de Fournisseur AI",
        description: "Basculez entre Claude (Cloud) et Ollama (Local) directement depuis le chat.",
        icon: <Zap className="w-4 h-4 text-blue-400" />
      },
      {
        type: "feat",
        label: "Assistant Vocal Proactif",
        description: "Discussion bidirectionnelle avec STT réel et feedback vocal lors du lancement d'agents.",
        icon: <Volume2 className="w-4 h-4 text-purple-400" />
      },
      {
        type: "feat",
        label: "Mode 'Stay Awake'",
        description: "L'application empêche désormais la mise en veille du système lorsqu'elle est active (version .exe).",
        icon: <Monitor className="w-4 h-4 text-emerald-400" />
      }
    ]
  },
  {
    version: "1.1.0",
    date: "14 Avril 2026",
    title: "Multimodalité & Stabilité",
    items: [
      {
        type: "feat",
        label: "Assistant Vocal (ElevenLabs)",
        description: "Intégration initiale via API Route sécurisée.",
        icon: <Zap className="w-4 h-4 text-blue-400" />
      },
      {
        type: "feat",
        label: "Google OAuth (Gmail)",
        description: "Identifiants Google Cloud configurés.",
        icon: <Shield className="w-4 h-4 text-emerald-400" />
      },
      {
        type: "fix",
        label: "Robustesse du Build",
        description: "Correction des erreurs de typage et des imports.",
        icon: <Bug className="w-4 h-4 text-amber-400" />
      }
    ]
  }
];

export default function ChangelogPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-gradient-to-b from-[--color-bg] to-[--color-surface] custom-scrollbar">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-12 h-12 rounded-2xl bg-[--color-cta]/10 flex items-center justify-center text-[--color-cta] mb-6"
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-serif text-[--color-text]"
          >
            Nouveautés
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg text-[--color-text-secondary] font-medium"
          >
            Suivez l'évolution de ProspectOS et découvrez les dernières fonctionnalités.
          </motion.p>
        </div>

        {/* Timeline */}
        <div className="space-y-20 relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-[--color-border] hidden sm:block" />

          {CHANGELOG.map((release, rIdx) => (
            <div key={release.version} className="relative group">
              {/* Version Badge (Mobile) */}
              <div className="sm:hidden mb-4">
                 <span className="text-xs font-bold uppercase tracking-widest text-[--color-cta] px-2 py-1 rounded bg-[--color-cta]/10 border border-[--color-cta]/20">
                    {release.version}
                 </span>
              </div>

              <div className="sm:grid sm:grid-cols-[120px_1fr] gap-12">
                {/* Desktop Version/Date */}
                <div className="hidden sm:block pt-1 text-right">
                  <div className="text-sm font-bold text-[--color-text] font-mono">{release.version}</div>
                  <div className="text-xs text-[--color-text-tertiary] font-medium mt-1 uppercase tracking-tighter">{release.date}</div>
                </div>

                {/* Content Card */}
                <div className="space-y-6">
                  <div className="relative pb-2">
                     {/* Timeline Dot */}
                     <div className="absolute -left-[57.5px] top-2 w-3 h-3 rounded-full bg-[--color-bg] border-2 border-[--color-cta] hidden sm:block shadow-[0_0_8px_rgba(201,100,66,0.3)]" />
                     <h2 className="text-2xl font-semibold text-[--color-text] tracking-tight">{release.title}</h2>
                  </div>

                  <div className="grid gap-4">
                    {release.items.map((item, iIdx) => (
                      <motion.div
                        key={iIdx}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: iIdx * 0.1 }}
                        className="p-5 rounded-2xl border border-[--color-border] bg-[--color-surface] hover:border-[--color-border-warm] transition-all group/item shadow-whisper"
                      >
                        <div className="flex items-start gap-4">
                           <div className="w-9 h-9 rounded-xl bg-[--color-surface-2] border border-[--color-border] flex items-center justify-center group-hover/item:scale-110 transition-transform">
                              {item.icon}
                           </div>
                           <div className="space-y-1">
                              <p className="text-sm font-bold text-[--color-text]">{item.label}</p>
                              <p className="text-xs text-[--color-text-tertiary] leading-relaxed">
                                 {item.description}
                              </p>
                           </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-12 text-center">
            <p className="text-xs text-[--color-text-tertiary] font-medium uppercase tracking-widest">
                Uprising Outreach Infrastructure · Montreal, QC
            </p>
        </div>
      </div>
    </div>
  );
}
