"use client";

import { motion } from "framer-motion";
import { User, Shield, Key, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function AccountSettings() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-12"
    >
      <section>
        <h1 className="text-2xl font-serif mb-2">Profil</h1>
        <p className="text-sm text-[--color-text-secondary] mb-8">
          Gérez vos informations personnelles et votre identité sur la plateforme.
        </p>

        <div className="flex items-center gap-6 mb-8">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#e08a5a] to-[#c96442] flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              K
            </div>
            <button className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
              Changer
            </button>
          </div>
          <div>
            <h3 className="text-base font-medium text-[--color-text]">Kael</h3>
            <p className="text-sm text-[--color-text-tertiary]">kael@uprising-outreach.com</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 max-w-2xl">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[--color-text-tertiary]">Prénom</label>
            <Input defaultValue="Kael" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[--color-text-tertiary]">Nom</label>
            <Input defaultValue="Uprising" />
          </div>
          <div className="space-y-2 col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[--color-text-tertiary]">Email professionnel</label>
            <Input defaultValue="kael@uprising-outreach.com" disabled />
            <p className="text-[10px] text-[--color-text-tertiary]">L'email est géré par votre administrateur de workspace.</p>
          </div>
        </div>
        
        <div className="mt-8">
          <Button variant="secondary" size="sm">Sauvegarder les modifications</Button>
        </div>
      </section>

      <div className="h-px bg-[--color-border]" />

      <section className="space-y-6">
        <div className="flex items-center gap-2 text-[--color-text]">
          <Shield className="w-5 h-5" />
          <h2 className="text-lg font-medium">Sécurité</h2>
        </div>

        <div className="space-y-4 max-w-2xl">
          <div className="p-4 rounded-xl border border-[--color-border] bg-[--color-surface] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[--color-surface-2] flex items-center justify-center">
                <Key className="w-4 h-4 text-[--color-text-secondary]" />
              </div>
              <div>
                <p className="text-sm font-medium">Mot de passe</p>
                <p className="text-xs text-[--color-text-tertiary]">Dernière modification il y a 3 mois</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">Mettre à jour</Button>
          </div>

          <div className="p-4 rounded-xl border border-[--color-border] bg-[--color-surface] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[--color-surface-2] flex items-center justify-center text-xs font-bold text-[--color-text-secondary]">
                2FA
              </div>
              <div>
                <p className="text-sm font-medium">Authentification à deux facteurs</p>
                <p className="text-xs text-[--color-text-tertiary]">Sécurisez votre compte avec une application TOTP</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">Activer</Button>
          </div>
        </div>
      </section>

      <div className="h-px bg-[--color-border]" />

      <section>
        <Button variant="danger" size="sm" className="gap-2">
          <LogOut className="w-4 h-4" />
          Se déconnecter de toutes les sessions
        </Button>
      </section>
    </motion.div>
  );
}
