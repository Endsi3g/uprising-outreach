"use client";

import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export default function SecretaryPage() {
  return (
    <div className="flex flex-col h-full bg-[--color-bg] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-64 h-64 bg-[--color-cta] rounded-full blur-3xl animate-pulse" />
      </div>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="text-center mb-8">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[--color-surface-2] border border-[--color-border] text-[10px] font-bold uppercase tracking-widest text-[--color-text-secondary] mb-4">
             <Bot size={12} className="text-[--color-cta]" /> Assistant NanoClaw
           </div>
           <h1 className="text-3xl font-serif font-medium text-[--color-text]">Secrétaire Virtuelle</h1>
           <p className="text-[--color-text-tertiary] mt-2">Gestion automatique de vos projets, titres de chat et organisation.</p>
        </div>
        
        <div className="w-full max-w-4xl">
          <AnimatedAIChat />
        </div>
      </main>
    </div>
  );
}
