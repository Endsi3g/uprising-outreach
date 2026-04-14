"use client";

import { motion } from "framer-motion";
import { 
  Download, 
  Monitor, 
  Terminal, 
  Apple, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const DOWNLOADS = [
  {
    name: "Windows",
    version: "v1.0.4",
    icon: <Monitor className="w-6 h-6" />,
    filename: "ProspectOS-Setup-1.0.4.exe",
    platform: "win"
  },
  {
    name: "macOS",
    version: "v1.0.4 (Apple Silicon & Intel)",
    icon: <Apple className="w-6 h-6" />,
    filename: "ProspectOS-1.0.4.dmg",
    platform: "mac"
  }
];

const EXTENSIONS = [
  {
    name: "Chrome Extension",
    status: "BETA",
    description: "Capturez des leads LinkedIn et des insights d'entreprise en un clic.",
    icon: <Globe className="w-8 h-8 text-blue-500" />,
    link: "#"
  },
  {
    name: "Extension CLI Terminal",
    status: "DEVELOPER",
    description: "L'interface ligne de commande pour automatiser ProspectOS via scripts.",
    icon: <Terminal className="w-8 h-8 text-[--color-cta]" />,
    link: "#"
  }
];

export default function DownloadPage() {
  const handleDownload = (filename: string) => {
    // In a real app, this would be a direct link to a bucket
    alert(`Téléchargement de ${filename} lancé. Note: En développement, assurez-vous d'avoir lancé 'npm run build:electron'.`);
  };

  return (
    <div className="flex flex-col h-full bg-[--color-background] p-8 max-w-5xl mx-auto">
      <header className="mb-12 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 rounded-2xl bg-[--color-cta]/10 flex items-center justify-center text-[--color-cta] mx-auto mb-6"
        >
          <Download className="w-8 h-8" />
        </motion.div>
        <h1 className="text-4xl font-serif font-medium text-[--color-text] mb-4">Emportez ProspectOS partout</h1>
        <p className="text-[--color-text-tertiary] max-w-xl mx-auto">
          Synchronisez votre prospection sur tous vos appareils. Desktop, navigateur ou terminal.
        </p>
      </header>

      {/* Desktop Apps */}
      <section className="mb-16">
        <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-[--color-text-tertiary]" /> 
          Applications Desktop
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOWNLOADS.map((app) => (
            <div 
              key={app.platform}
              className="group bg-[--color-surface] border border-[--color-border] rounded-2xl p-6 flex items-center justify-between hover:border-[--color-cta]/30 transition-all shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[--color-surface-2] flex items-center justify-center text-[--color-text]">
                  {app.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-[--color-text]">{app.name}</h3>
                  <p className="text-xs text-[--color-text-tertiary]">{app.version}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDownload(app.filename)}
                className="px-4 py-2 bg-[--color-text] text-white rounded-lg text-sm font-medium hover:bg-black transition-colors"
              >
                Télécharger
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Browser & Dev Extensions */}
      <section className="mb-16">
        <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-[--color-text-tertiary]" /> 
          Extensions & Outils
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {EXTENSIONS.map((ext) => (
            <div 
              key={ext.name}
              className="bg-[--color-surface] border border-[--color-border] rounded-2xl p-8 relative overflow-hidden group hover:shadow-lg transition-all"
            >
              <div className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-[--color-surface-2] text-[--color-text-tertiary]">
                 {ext.status}
              </div>
              <div className="mb-6">{ext.icon}</div>
              <h3 className="text-xl font-serif font-medium text-[--color-text] mb-3">{ext.name}</h3>
              <p className="text-sm text-[--color-text-tertiary] leading-relaxed mb-8">
                {ext.description}
              </p>
              <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[--color-cta] group-hover:gap-3 transition-all">
                Ajouter à mon espace <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Security Banner */}
      <div className="mt-auto bg-[--color-surface-2]/50 border border-[--color-border-subtle] rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
         <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
            <ShieldCheck className="w-6 h-6" />
         </div>
         <div>
            <h4 className="text-sm font-semibold text-[--color-text]">Signé numériquement & Sécurisé</h4>
            <p className="text-xs text-[--color-text-tertiary]">Toutes nos applications sont vérifiées et exemptes de logiciels malveillants.</p>
         </div>
         <div className="md:ml-auto flex items-center gap-2 text-[--color-text-tertiary]">
            <Zap className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Version 1.0.4 Active</span>
         </div>
      </div>
    </div>
  );
}
