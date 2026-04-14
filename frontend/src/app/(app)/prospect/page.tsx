"use client";

import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import { PageHeader } from "@/components/ui/PageHeader";
import { Building2, Users, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProspectPage() {
  return (
    <div className="flex flex-col h-full bg-[--color-bg]">
      <div className="flex-1 p-8 lg:p-16 overflow-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PageHeader
              title="Nouvelle Prospection"
              description="Découvrez des prospects qualifiés grâce à l'intelligence sémantique."
            />

            {/* AI Experience Area: Integrating the new chat component */}
            <div className="mt-12">
               <AnimatedAIChat />
            </div>

            {/* Criteria Grid */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { 
                   icon: <Building2 size={20} />, 
                   title: "Entreprises", 
                   desc: "Ciblez par industrie, taille, technologies utilisées ou croissance.",
                 },
                 { 
                   icon: <Users size={20} />, 
                   title: "Personnes", 
                   desc: "Trouvez les bons interlocuteurs par titre de poste, ancienneté et influence.",
                 },
                 { 
                   icon: <Globe size={20} />, 
                   title: "Signaux", 
                   desc: "Identifiez les moments clés : levées de fonds, recrutements, nouvelles offres.",
                 }
               ].map((item, i) => (
                 <motion.div
                   key={i}
                   whileHover={{ y: -4 }}
                   className="p-8 rounded-2xl border border-[--color-border] bg-[--color-surface] hover:shadow-whisper transition-all duration-300 group"
                 >
                   <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-[--color-bg] border border-[--color-border] transition-colors group-hover:border-[--color-cta]/30 group-hover:text-[--color-cta]")}>
                     {item.icon}
                   </div>
                   <h3 className="text-xl font-serif font-medium text-[--color-text] mb-3">{item.title}</h3>
                   <p className="text-sm text-[--color-text-secondary] leading-relaxed">
                     {item.desc}
                   </p>
                 </motion.div>
               ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
