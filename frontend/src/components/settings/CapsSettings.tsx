"use client";

import { motion } from "framer-motion";
import { Zap, Brain, Cpu, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function CapsSettings() {
  const capabilities = [
    {
      id: "ai_analysis",
      label: "Analyse Heuristique IA",
      description: "Utilise Claude 3.5 Sonnet pour l'analyse profonde des signaux web.",
      status: "active",
      icon: <Brain className="w-5 h-5" />,
    },
    {
      id: "local_ollama",
      label: "Inférence Locale (Ollama)",
      description: "Permet de basculer sur des modèles locaux (Llama 3 / Gemma) pour les tâches simples.",
      status: "beta",
      icon: <Cpu className="w-5 h-5" />,
    },
    {
      id: "auto_outreach",
      label: "Auto-Outreach Adaptatif",
      description: "Ajuste automatiquement les horaires d'envoi selon le comportement du destinataire.",
      status: "active",
      icon: <Zap className="w-5 h-5" />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-12"
    >
      <section>
        <h1 className="text-2xl font-serif mb-2">Capacités</h1>
        <p className="text-sm text-[--color-text-secondary] mb-8">
          Activez ou configurez les modules d'intelligence et d'automatisation de ProspectOS.
        </p>

        <div className="space-y-4 max-w-2xl">
          {capabilities.map((cap) => (
            <div
              key={cap.id}
              className="p-5 rounded-2xl border border-[--color-border] bg-[--color-surface] flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[--color-surface-2] flex items-center justify-center text-[--color-text-secondary]">
                  {cap.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-medium">{cap.label}</h3>
                    {cap.status === "beta" && (
                      <Badge color="blue" className="uppercase text-[9px] font-bold">Beta</Badge>
                    )}
                  </div>
                  <p className="text-sm text-[--color-text-tertiary] leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              </div>
              <button
                className={cn(
                  "relative w-11 h-6 rounded-full transition-colors flex-shrink-0 mt-1",
                  cap.status === "active" || cap.id === "local_ollama" ? "bg-[--color-cta]" : "bg-[--color-border]"
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                    cap.status === "active" || cap.id === "local_ollama" ? "translate-x-[22px]" : "translate-x-[2px]"
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-[--color-border]" />

      <section>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-[--color-text]" />
          <h2 className="text-lg font-medium">Modèles Prioritaires</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          {[
            { name: "Claude 3.5 Sonnet", provider: "Anthropic", current: true },
            { name: "Gemma 2 9B", provider: "Local (Ollama)", current: false },
            { name: "Llama 3.1 70B", provider: "Groq", current: false },
            { name: "GPT-4o", provider: "OpenAI", current: false },
          ].map((m) => (
            <button
              key={m.name}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                m.current 
                  ? "border-[--color-cta] bg-[--color-surface-2]" 
                  : "border-[--color-border] bg-[--color-surface] hover:border-[--color-border-warm]"
              )}
            >
              <p className="text-sm font-semibold">{m.name}</p>
              <p className="text-xs text-[--color-text-tertiary]">{m.provider}</p>
            </button>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

import { cn } from "@/lib/utils";
