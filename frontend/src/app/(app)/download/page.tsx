"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function DownloadPage() {
  const handleDownload = () => {
    // This will eventually trigger the electron build script locally
    alert("Démarrage du build Electron local... (.exe en cours de génération)");
  };

  return (
    <div className="flex flex-col h-full bg-[#141413] text-white overflow-y-auto custom-scrollbar px-8 py-20">
      <div className="max-w-4xl mx-auto w-full text-center space-y-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-serif font-medium"
        >
          Faites plus avec Claude, partout où vous travaillez.
        </motion.h1>

        {/* Main Desktop Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative group rounded-[32px] bg-[#1e1e1c] border border-white/5 p-12 overflow-hidden text-left"
        >
          <div className="max-w-md relative z-10">
            <h2 className="text-xl font-medium mb-4">Bureau</h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-8">
              Chattez, collaborez et codez dans une seule application. Claude fonctionne avec vos fichiers, applications et onglets de navigateur.
            </p>
            <Button 
                variant="primary" 
                size="lg" 
                onClick={handleDownload}
                className="bg-white text-black hover:bg-gray-200"
            >
              Télécharger pour Windows
            </Button>
          </div>

          {/* Decorative UI Elements (Mock Claude Desktop Interface) */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 p-8 flex flex-col gap-4 pointer-events-none">
             <div className="flex gap-2 justify-end mb-4">
               <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center transform rotate-6">
                 📁
               </div>
               <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] transform -rotate-3 mt-8">
                  Mon dossier de téléchargements est en désordre ! Pouvez-vous le ranger ?
               </div>
             </div>
             
             <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-[10px] w-64 self-end">
                Transformer ces reçus en note de frais
             </div>

             <div className="p-4 rounded-xl bg-[#c96442]/20 border border-[#c96442]/30 text-[10px] w-56 self-center transform -rotate-2">
                Créer une liste de courses, aller sur Chrome et passer une commande
             </div>
          </div>
        </motion.div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-2 gap-8">
          {/* Claude Code */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[32px] bg-[#1e1e1c] border border-white/5 p-8 text-left h-full"
          >
            <h3 className="text-lg font-medium mb-3">Claude Code</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-8">
              Créez, déboguez et déployez depuis votre terminal ou IDE.
            </p>
            
            <div className="space-y-3">
               {[
                 { label: "Terminal", action: "Installer" },
                 { label: "VS Code", action: "Installer" },
                 { label: "Application Bureau", action: "Télécharger" },
                 { label: "JetBrains", action: "Installer" }
               ].map((item) => (
                 <div key={item.label} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group/row">
                    <span className="text-sm font-medium text-gray-400 group-hover/row:text-white transition-colors">{item.label}</span>
                    <button className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover/row:text-[#c96442] transition-colors">{item.action} ↗</button>
                 </div>
               ))}
            </div>
          </motion.div>

          {/* Mobile */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[32px] bg-[#1e1e1c] border border-white/5 p-8 text-left h-full flex flex-col"
          >
            <h3 className="text-lg font-medium mb-3">Mobile</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-8">
              Discutez en mains libres, connectez Claude à vos applications préférées et lancez des tâches en déplacement.
            </p>
            
            <div className="space-y-3 mb-8">
               {[
                 { label: "iOS", icon: "🍎" },
                 { label: "Android", icon: "🤖" }
               ].map((item) => (
                 <div key={item.label} className="flex items-center justify-between p-3 rounded-xl border border-white/10 group/row hover:bg-white/5">
                    <div className="flex items-center gap-3">
                       <span className="text-xl">{item.icon}</span>
                       <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <button className="text-[10px] font-bold uppercase tracking-widest text-[#c96442]">Télécharger</button>
                 </div>
               ))}
            </div>

            {/* Visual Chat Mock */}
            <div className="mt-auto p-4 rounded-xl bg-white/5 border border-white/10 text-[10px] flex flex-col gap-2">
               <p className="text-gray-400 italic">Examinons vos dernières exécutions et établissons un plan pour réduire le temps.</p>
               <div className="w-12 h-1.5 rounded-full bg-[#c96442] self-end" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
