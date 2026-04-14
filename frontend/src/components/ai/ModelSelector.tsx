"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AI_MODELS, type AIModel } from "@/types/ai";

interface Props {
  model: AIModel;
  onChange: (m: AIModel) => void;
}

export function ModelSelector({ model, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const current = AI_MODELS.find((m) => m.id === model) ?? AI_MODELS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[--color-border] bg-[--color-surface] text-[--color-text-secondary] hover:text-[--color-text] hover:border-[--color-border-warm] transition-all"
      >
        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", current.id.startsWith("ollama") ? "bg-emerald-500" : "bg-[--color-cta]")} />
        {current.label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-0.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-full mt-1.5 z-20 w-52 bg-[--color-bg] border border-[--color-border] rounded-xl shadow-lg overflow-hidden"
            >
              {AI_MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { onChange(m.id); setOpen(false); }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-[--color-surface-2] transition-colors text-left",
                    m.id === model && "bg-[--color-surface]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", m.id.startsWith("ollama") ? "bg-emerald-500" : "bg-[--color-cta]")} />
                    <span className="font-medium text-[--color-text]">{m.label}</span>
                  </div>
                  {m.badge && (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[--color-text-tertiary] px-1.5 py-0.5 rounded-full bg-[--color-surface] border border-[--color-border]">
                      {m.badge}
                    </span>
                  )}
                </button>
              ))}

              <div className="px-3 py-2 border-t border-[--color-border]">
                <p className="text-[10px] text-[--color-text-tertiary]">
                  Modèles locaux via{" "}
                  <span className="font-medium">Ollama</span> ({" "}
                  <code className="text-[9px]">ollama serve</code> )
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
