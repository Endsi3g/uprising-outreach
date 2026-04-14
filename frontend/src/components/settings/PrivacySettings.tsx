"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Globe, Database, UserCheck } from "lucide-react";

export function PrivacySettings() {
  const [localOnly, setLocalOnly] = useState(true);
  const [tracking, setTracking] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-12"
    >
      <section>
        <h1 className="text-2xl font-serif mb-2">Confidentialité</h1>
        <p className="text-sm text-[--color-text-secondary] mb-8">
          Contrôlez vos données et la manière dont ProspectOS interagit avec le web public.
        </p>

        <div className="space-y-6 max-w-2xl">
          <div className="flex items-start justify-between p-6 rounded-2xl border border-[--color-border] bg-[--color-surface] gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-medium mb-1">Mode Souveraineté Locale (Québec)</h3>
                <p className="text-sm text-[--color-text-tertiary] leading-relaxed">
                  Limite le traitement des données aux serveurs situés dans l'Est du Canada pour une conformité maximale avec la Loi 25.
                </p>
              </div>
            </div>
            <button
              onClick={() => setLocalOnly(!localOnly)}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors flex-shrink-0 mt-1",
                localOnly ? "bg-[--color-cta]" : "bg-[--color-border]"
              )}
            >
              <motion.div
                animate={{ x: localOnly ? 22 : 2 }}
                className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>

          <div className="flex items-start justify-between p-6 rounded-2xl border border-[--color-border] bg-[--color-surface] gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-medium mb-1">Anonymisation du Crawling</h3>
                <p className="text-sm text-[--color-text-tertiary] leading-relaxed">
                  Utilise des proxys résidentiels québécois lors de l'analyse des sites de prospects pour éviter le blocage et rester discret.
                </p>
              </div>
            </div>
            <div className="mt-1">
              <Badge color="amber" className="uppercase text-[9px] font-bold">Activé</Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-[--color-border]" />

      <section className="space-y-6">
        <div className="flex items-center gap-2 text-[--color-text]">
          <UserCheck className="w-5 h-5" />
          <h2 className="text-lg font-medium">Données de l'Application</h2>
        </div>

        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Télémétrie d'usage</p>
              <p className="text-xs text-[--color-text-tertiary]">Partagez des données anonymes pour améliorer les modèles de prospection.</p>
            </div>
            <button
              onClick={() => setTracking(!tracking)}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors flex-shrink-0",
                tracking ? "bg-[--color-cta]" : "bg-[--color-border]"
              )}
            >
              <motion.div
                animate={{ x: tracking ? 22 : 2 }}
                className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Historique de discussion IA</p>
              <p className="text-xs text-[--color-text-tertiary]">L'historique est chiffré et stocké localement par défaut.</p>
            </div>
            <button className="text-xs text-[--color-cta] font-medium hover:underline">Supprimer tout</button>
          </div>
        </div>
      </section>

      <div className="h-px bg-[--color-border]" />

      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-red-500 mb-6">Zone de Danger</h2>
        <div className="p-6 rounded-2xl border border-red-200 bg-red-50/50">
          <h3 className="text-base font-medium text-red-900 mb-1">Supprimer le compte</h3>
          <p className="text-sm text-red-700 mb-6 leading-relaxed">
            Cette action est irréversible. Toutes vos campagnes, prospects et configurations seront supprimés définitivement.
          </p>
          <Button variant="danger" size="sm">Demander la suppression</Button>
        </div>
      </section>
    </motion.div>
  );
}

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
