"use client";

import { motion } from "framer-motion";
import { CreditCard, Download, ExternalLink, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function BillingSettings() {
  const invoices = [
    { date: "12 Avr 2026", amount: "49.00 $", status: "Payé", id: "INV-2026-003" },
    { date: "12 Mar 2026", amount: "49.00 $", status: "Payé", id: "INV-2026-002" },
    { date: "12 Fév 2026", amount: "49.00 $", status: "Payé", id: "INV-2026-001" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-12"
    >
      <section>
        <h1 className="text-2xl font-serif mb-2">Facturation</h1>
        <p className="text-sm text-[--color-text-secondary] mb-8">
          Gérez votre abonnement, vos moyens de paiement et vos factures.
        </p>

        <div className="p-6 rounded-2xl border border-[--color-border] bg-gradient-to-br from-[--color-surface] to-[--color-surface-2] shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-[--color-cta]/10 flex items-center justify-center text-[--color-cta]">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-base font-semibold">Forfait ProspectOS Pro</h3>
                <Badge color="green" className="uppercase text-[9px] font-bold">Actif</Badge>
              </div>
              <p className="text-sm text-[--color-text-tertiary]">Facturation annuelle · Renouvellement le 12 Fév 2027</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">49 $<span className="text-sm font-normal text-[--color-text-tertiary]">/mois</span></p>
            <button className="text-xs text-[--color-cta] font-medium hover:underline mt-1">Changer de forfait</button>
          </div>
        </div>
      </section>

      <div className="h-px bg-[--color-border]" />

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[--color-text]">
            <CreditCard className="w-5 h-5" />
            <h2 className="text-lg font-medium">Moyen de paiement</h2>
          </div>
          <Button variant="secondary" size="sm">Ajouter</Button>
        </div>

        <div className="p-5 rounded-xl border border-[--color-border] bg-[--color-surface] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 rounded border border-[--color-border] flex items-center justify-center font-bold text-[10px] text-[--color-text-tertiary] bg-white">
              VISA
            </div>
            <div>
              <p className="text-sm font-medium">Visa se terminant par 4242</p>
              <p className="text-xs text-[--color-text-tertiary]">Expire le 12/28 · Principal</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="h-8">Modifier</Button>
        </div>
      </section>

      <div className="h-px bg-[--color-border]" />

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[--color-text-secondary]">Historique des factures</h2>
          <Button variant="secondary" size="sm" className="gap-2 h-8">
            <ExternalLink className="w-3.5 h-3.5" />
            Portail Stripe
          </Button>
        </div>

        <div className="overflow-hidden border border-[--color-border] rounded-xl bg-[--color-surface]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[--color-surface-2] text-[--color-text-secondary] border-b border-[--color-border]">
              <tr>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">ID</th>
                <th className="px-6 py-3 font-semibold">Montant</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--color-border]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[--color-surface-2]/50 transition-colors">
                  <td className="px-6 py-4">{inv.date}</td>
                  <td className="px-6 py-4 text-[--color-text-tertiary] font-mono text-xs">{inv.id}</td>
                  <td className="px-6 py-4 font-medium">{inv.amount}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:text-[--color-cta] transition-colors" title="Télécharger">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  );
}
