"use client";

import { motion } from "framer-motion";
import { Terminal, Code2, Copy, Check, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function ClaudeCodeSettings() {
  const [copied, setCopied] = useState(false);
  const apiKey = "sk-ant-api03-P9...f2A";

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-12"
    >
      <section>
        <div className="flex items-center gap-3 mb-2">
          <Terminal className="w-6 h-6 text-[--color-cta]" />
          <h1 className="text-2xl font-serif">ProspectOS CLI</h1>
        </div>
        <p className="text-sm text-[--color-text-secondary] mb-8 leading-relaxed max-w-2xl">
          Utilisez la puissance de l'IA directement dans votre terminal. ProspectOS CLI permet de générer des scripts de prospection, d'analyser vos logs de campagne et d'automatiser vos workflows locaux.
        </p>

        <div className="p-6 rounded-2xl border border-[--color-border] bg-gradient-to-br from-[--color-surface] to-[--color-surface-2] space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[--color-text-tertiary]">Installation Rapide</h3>
            <div className="flex items-center gap-2 bg-black text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-zinc-800">
              <span className="text-zinc-500">$</span>
              <span>npm install -g @prospectos/cli</span>
              <button 
                onClick={() => navigator.clipboard.writeText("npm install -g @prospectos/cli")}
                className="ml-auto text-zinc-500 hover:text-white transition-colors"
                title="Copier"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[--color-text-tertiary]">Clé API Terminal</h3>
            <div className="flex gap-2">
              <div className="flex-1 bg-[--color-surface] border border-[--color-border] px-4 py-2.5 rounded-xl font-mono text-sm text-[--color-text-secondary] flex items-center justify-between">
                <span>{apiKey}</span>
                <button onClick={handleCopy} className="text-[--color-cta] hover:text-[--color-cta-hover]">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <Button variant="secondary">Générer</Button>
            </div>
            <p className="text-[10px] text-[--color-text-tertiary]">Ne partagez jamais cette clé. Elle donne accès à vos crédits d'inférence IA.</p>
          </div>
        </div>
      </section>

      <div className="h-px bg-[--color-border]" />

      <section>
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-[--color-text]" />
          <h2 className="text-lg font-medium">Fonctionnalités CLI</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { 
              title: "Exécution de scripts", 
              desc: "Générez et exécutez des scripts Node/Python pour vos campagnes.",
              icon: <Code2 className="w-4 h-4" />
            },
            { 
              title: "Mode Streaming", 
              desc: "Recevez les réponses de l'IA en temps réel dans votre shell.",
              icon: <Terminal className="w-4 h-4" />
            }
          ].map((f, i) => (
            <div key={i} className="p-4 rounded-xl border border-[--color-border] bg-[--color-surface] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[--color-surface-2] flex items-center justify-center text-[--color-cta]">
                {f.icon}
              </div>
              <h4 className="text-sm font-medium">{f.title}</h4>
              <p className="text-xs text-[--color-text-tertiary] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
