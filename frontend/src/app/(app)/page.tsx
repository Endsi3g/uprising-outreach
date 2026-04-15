"use client";

import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import { motion } from "framer-motion";
import { Activity, Cpu, Sparkles } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface DashboardStats {
  total_leads: number;
  sent_emails: number;
  replied_leads: number;
}

export default function DashboardPage() {
  const { data: user } = useCurrentUser();
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["leads-stats"],
    queryFn: () => apiClient.get<DashboardStats>("/leads/stats"),
    staleTime: 30_000,
  });

  const replyRate =
    stats && stats.sent_emails > 0
      ? `${Math.round((stats.replied_leads / stats.sent_emails) * 100)}%`
      : "—";

  return (
    <div className="flex flex-col h-full bg-[--color-background] overflow-x-hidden">
      <main className="flex-1 flex flex-col items-center justify-center pt-16 pb-24 px-6 relative z-10 w-full max-w-4xl mx-auto min-h-[calc(100vh-8rem)]">

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-8 w-full"
        >
          <h1 className="text-[2.25rem] md:text-[2.75rem] font-serif font-medium text-[--color-text] tracking-tight mb-4">
            Bonjour, {user?.first_name ?? "…"}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[15px] font-sans text-[--color-text-secondary]">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[--color-cta] animate-pulse" />
              <span>{stats?.total_leads ?? "—"} leads détectés</span>
            </div>
            <span className="hidden sm:inline text-[--color-text-tertiary]">•</span>
            <span>{stats?.sent_emails ?? "—"} emails envoyés</span>
            <span className="hidden sm:inline text-[--color-text-tertiary]">•</span>
            <span>Taux de réponse {replyRate}</span>
          </div>
        </motion.div>

        {/* Central Chat Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="w-full max-w-3xl mb-12 relative"
        >
             <AnimatedAIChat />
        </motion.div>

        {/* Suggested Actions (Minimalist pills/cards) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-2xl flex flex-wrap justify-center gap-3"
        >
          <div className="w-full text-center mb-3">
            <span className="text-[12px] font-sans font-medium text-[--color-text-tertiary] uppercase tracking-widest">
              Suggestions d&apos;actions
            </span>
          </div>

          <Link href="/leads" className="group flex items-center gap-2.5 px-4 py-2.5 bg-[--color-surface] rounded-full border border-[--color-border] hover:border-[--color-cta]/30 hover:bg-[--color-surface-2] transition-all duration-300 ease-out shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 ring-1 ring-inset ring-[--color-text-tertiary]/10 group-hover:ring-[--color-cta]/20 rounded-full transition-all duration-300" />
            <Sparkles className="w-4 h-4 text-[--color-cta]" />
            <span className="text-[14px] font-sans text-[--color-text] font-medium">Lancer une recherche de prospects</span>
          </Link>

          <Link href="/projects" className="group flex items-center gap-2.5 px-4 py-2.5 bg-[--color-surface] rounded-full border border-[--color-border] hover:border-[--color-text-tertiary] hover:bg-[--color-surface-2] transition-all duration-300 ease-out shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 ring-1 ring-inset ring-[--color-text-tertiary]/10 group-hover:ring-[--color-text-tertiary]/30 rounded-full transition-all duration-300" />
            <Activity className="w-4 h-4 text-[--color-text-secondary] group-hover:text-[--color-text]" />
            <span className="text-[14px] font-sans text-[--color-text-secondary] group-hover:text-[--color-text] font-medium">Analyser le domaine d&apos;un prospect</span>
          </Link>

          <Link href="/campaigns" className="group flex items-center gap-2.5 px-4 py-2.5 bg-[--color-surface] rounded-full border border-[--color-border] hover:border-[--color-text-tertiary] hover:bg-[--color-surface-2] transition-all duration-300 ease-out shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 ring-1 ring-inset ring-[--color-text-tertiary]/10 group-hover:ring-[--color-text-tertiary]/30 rounded-full transition-all duration-300" />
            <Cpu className="w-4 h-4 text-[--color-text-secondary] group-hover:text-[--color-text]" />
            <span className="text-[14px] font-sans text-[--color-text-secondary] group-hover:text-[--color-text] font-medium">Optimiser les séquences actives</span>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
