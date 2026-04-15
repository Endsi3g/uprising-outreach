"use client";

import { motion } from "framer-motion";
import { Mic, Volume2, Settings, X } from "lucide-react";
import { useState } from "react";

export default function VoiceAssistantPage() {
  const [isListening, setIsListening] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#141413] text-white relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{
            scale: isListening ? [1, 1.2, 1] : 1,
            opacity: isListening ? [0.1, 0.2, 0.1] : 0.1,
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c96442] rounded-full blur-[128px]"
        />
      </div>

      {/* Top Header */}
      <header className="flex items-center justify-between p-6 relative z-10">
        <div className="flex items-center gap-2">
           <span className="text-[#c96442] text-xl">✺</span>
           <span className="font-serif text-lg tracking-tight">Voice Assistant</span>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <Settings size={20} className="text-white/40" />
        </button>
      </header>

      {/* Main Experience */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10">
        <div className="text-center mb-16 px-6">
           <h1 className="text-4xl font-serif font-medium mb-4">
             {isListening ? "Je vous écoute..." : "À votre écoute"}
           </h1>
           <p className="text-white/40 max-w-sm mx-auto">
             Dites "Nouvelle prospection" ou demandez une analyse de site web.
           </p>
        </div>

        {/* Visualizer Circle */}
        <div className="relative group cursor-pointer" onClick={() => setIsListening(!isListening)}>
           <motion.div 
             animate={isListening ? { scale: [1, 1.1, 1] } : {}}
             transition={{ repeat: Infinity, duration: 1 }}
             className="w-48 h-48 rounded-full border-2 border-[#c96442]/30 flex items-center justify-center relative"
           >
              {isListening && (
                <div className="absolute inset-0 flex items-center justify-center gap-1.5">
                   {[...Array(5)].map((_, i) => (
                     <motion.div 
                       key={i}
                       animate={{ height: [10, 40, 10] }}
                       transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                       className="w-1.5 bg-[#c96442] rounded-full"
                     />
                   ))}
                </div>
              )}
              {!isListening && <Mic size={40} className="text-[#c96442]" />}
           </motion.div>
           
           <div className="absolute -inset-8 bg-[#c96442]/5 rounded-full blur-2xl group-hover:bg-[#c96442]/10 transition-all opacity-0 group-hover:opacity-100" />
        </div>

        <div className="mt-16 text-white/20 text-xs font-mono tracking-widest uppercase">
          Neural Engine Active
        </div>
      </main>

      {/* Bottom Controls */}
      <footer className="p-12 flex justify-center relative z-10">
         <div className="flex items-center gap-8 text-white/40">
            <Volume2 size={24} className="hover:text-white transition-colors cursor-pointer" />
            <X size={24} className="hover:text-white transition-colors cursor-pointer" onClick={() => window.history.back()} />
         </div>
      </footer>
    </div>
  );
}
