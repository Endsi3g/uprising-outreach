"use client";

import { motion } from "framer-motion";
import { Search, Globe, Zap, Target, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

const ACTIONS = [
  {
    title: "Audit Web Automatisé",
    description: "Lancez NanoClaw pour analyser la structure SEO et les gaps d'un prospect.",
    icon: <Globe className="w-5 h-5 text-blue-400" />,
    action: "audit",
    color: "blue"
  },
  {
    title: "Recherche de Leads",
    description: "Identifiez de nouveaux prospects qualifiés dans votre niche cible.",
    icon: <Target className="w-5 h-5 text-amber-400" />,
    action: "search",
    color: "amber"
  },
  {
    title: "Stratétie d'Approche",
    description: "Générez un angle de vente unique basé sur des signaux publics réels.",
    icon: <Zap className="w-5 h-5 text-purple-400" />,
    action: "strategy",
    color: "purple"
  }
];

export default function ProspectPage() {
  const router = useRouter();

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-gradient-to-b from-[--color-bg] to-[--color-surface]">
      <div className="max-w-4xl mx-auto space-y-12">
        
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
            Nouvelle Prospection
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg text-[--color-text-secondary] max-w-2xl leading-relaxed"
          >
            Sélectionnez une méthode pour commencer à enrichir votre pipeline avec des opportunités qualifiées.
          </motion.p>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ACTIONS.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="group p-6 rounded-3xl border border-[--color-border] bg-[--color-surface] hover:border-[--color-cta]/30 transition-all cursor-pointer shadow-whisper relative overflow-hidden"
              onClick={() => router.push(`/ai?action=${item.action}`)}
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                {item.icon}
              </div>
              
              <div className="w-10 h-10 rounded-xl bg-[--color-surface-2] border border-[--color-border] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              
              <h3 className="text-lg font-bold text-[--color-text] mb-2">{item.title}</h3>
              <p className="text-sm text-[--color-text-tertiary] leading-relaxed mb-6">
                {item.description}
              </p>
              
              <div className="flex items-center gap-2 text-xs font-bold text-[--color-cta] uppercase tracking-wider">
                Commencer <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Box */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-8 rounded-3xl bg-[--color-surface-2] border border-[--color-border] flex flex-col md:flex-row items-center gap-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-[--color-bg] flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-sm font-bold text-[--color-text] uppercase tracking-widest mb-1">Mode Souveraineté Québec</h4>
            <p className="text-sm text-[--color-text-secondary]">
              Toutes vos recherches respectent les protocoles de conformité locale et d'anonymisation du crawling.
            </p>
          </div>
          <button className="px-6 py-2.5 rounded-full border border-[--color-border] text-xs font-bold text-[--color-text-tertiary] hover:bg-[--color-bg] transition-all">
            En savoir plus
          </button>
        </motion.div>

      </div>
    </div>
  );
}
