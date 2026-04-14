"use client";

import { motion } from "framer-motion";
import { BarChart3, Mail, Users, Zap } from "lucide-react";

export function UsageSettings() {
  const usageStats = [
    {
      label: "Leads Enrichis",
      current: 842,
      limit: 1000,
      icon: <Users className="w-4 h-4" />,
      color: "var(--color-cta)",
    },
    {
      label: "Emails Envoyés",
      current: 4210,
      limit: 5000,
      icon: <Mail className="w-4 h-4" />,
      color: "#2563eb",
    },
    {
      label: "Requêtes IA (Core)",
      current: 125,
      limit: Infinity,
      icon: <Zap className="w-4 h-4" />,
      color: "#8b5cf6",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-12"
    >
      <section>
        <h1 className="text-2xl font-serif mb-2">Utilisation</h1>
        <p className="text-sm text-[--color-text-secondary] mb-10">
          Suivi de votre consommation de ressources pour la période de facturation en cours.
        </p>

        <div className="grid grid-cols-1 gap-8 max-w-2xl">
          {usageStats.map((stat, i) => {
            const percentage = stat.limit === Infinity ? 0 : (stat.current / stat.limit) * 100;
            return (
              <div key={i} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[--color-surface-2] flex items-center justify-center text-[--color-text-secondary]">
                      {stat.icon}
                    </div>
                    <span className="text-sm font-medium text-[--color-text]">{stat.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-[--color-text-secondary]">
                    {stat.current.toLocaleString()} {stat.limit !== Infinity ? `/ ${stat.limit.toLocaleString()}` : ""}
                  </span>
                </div>
                
                {stat.limit !== Infinity && (
                  <div className="h-2 w-full bg-[--color-surface-2] rounded-full overflow-hidden border border-[--color-border]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: stat.color }}
                    />
                  </div>
                )}
                
                <p className="text-[10px] text-[--color-text-tertiary] flex justify-between">
                  <span>Période: 1er Avril - 30 Avril</span>
                  {stat.limit !== Infinity && <span>{Math.round(percentage)}% utilisé</span>}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="h-px bg-[--color-border]" />

      <section>
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-[--color-text]" />
          <h2 className="text-lg font-medium">Activité Récente</h2>
        </div>
        
        <div className="h-[200px] w-full border border-[--color-border] rounded-xl bg-[--color-surface] flex items-end justify-around p-6 gap-2">
          {[40, 70, 45, 90, 65, 80, 50, 60, 85, 40].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="w-full max-w-[40px] bg-[--color-cta] rounded-t-md opacity-20 hover:opacity-100 transition-opacity cursor-help"
              title={`Jour ${i + 1}: ${h * 10} leads`}
            />
          ))}
        </div>
        <p className="text-[11px] text-[--color-text-tertiary] text-center mt-3 italic">
          Volume d'enrichissement de leads sur les 10 derniers jours.
        </p>
      </section>
    </motion.div>
  );
}
