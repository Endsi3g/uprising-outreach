"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, RotateCcw, Play, Pause } from "lucide-react";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { Button } from "@/components/ui/Button";
import { speak } from "@/lib/elevenlabs";

export function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");

  const handleStartListening = () => {
    setIsListening(true);
    setTranscript("Je vous écoute...");
    // Simulate speech recognition
    setTimeout(() => {
        setIsListening(false);
        setIsThinking(true);
        setTranscript("Kael: Peux-tu analyser mes performances de la semaine dernière ?");
        
        // Simulate thinking + AI response
        setTimeout(async () => {
            setIsThinking(false);
            const textResponse = "Kael, tes performances cette semaine sont impressionnantes. Tu as augmenté ton taux de conversion de 15% par rapport à la moyenne. Ton approche sur le segment SaaS montréalais est particulièrement efficace. Continue comme ça, mentor encourageant !";
            setResponse(textResponse);
            setIsSpeaking(true);
            
            // Trigger Eleven Labs
            await speak(textResponse);
            setIsSpeaking(false);
        }, 2000);
    }, 3000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[--color-bg] to-[--color-surface] overflow-hidden">
      <div className="max-w-2xl w-full flex flex-col items-center">
        
        {/* Visualizer Area */}
        <VoiceVisualizer 
            isListening={isListening} 
            isSpeaking={isSpeaking} 
            isThinking={isThinking} 
        />

        {/* Dynamic Transcript/Response Area */}
        <div className="h-40 flex flex-col items-center text-center space-y-4 z-10">
          <AnimatePresence mode="wait">
            {transcript && !response && (
                <motion.p
                    key="transcript"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-lg font-serif text-[--color-text-secondary] italic"
                >
                    "{transcript}"
                </motion.p>
            )}
            {response && (
                <motion.div
                    key="response"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                >
                    <p className="text-xl font-serif text-[--color-text] leading-relaxed max-w-xl">
                        {response}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-[--color-cta] px-2 py-0.5 rounded-full bg-[--color-cta]/10 border border-[--color-cta]/20">Mentor Encourageant</span>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="mt-12 flex items-center gap-8">
            <button 
                onClick={() => { setTranscript(""); setResponse(""); }}
                className="p-3 rounded-full text-[--color-text-tertiary] hover:bg-[--color-surface-2] transition-colors"
                title="Reinitialiser"
            >
                <RotateCcw size={20} />
            </button>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartListening}
                disabled={isListening || isThinking || isSpeaking}
                className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all",
                    isListening ? "bg-red-500 text-white" : "bg-[--color-cta] text-white",
                    (isThinking || isSpeaking) && "opacity-50 cursor-not-allowed"
                )}
            >
                {isListening ? <MicOff size={32} /> : <Mic size={32} />}
            </motion.button>

            <button className="p-3 rounded-full text-[--color-text-tertiary] hover:bg-[--color-surface-2] transition-colors">
                <Volume2 size={20} />
            </button>
        </div>

        <p className="mt-8 text-xs text-[--color-text-tertiary] font-medium uppercase tracking-widest">
            {isListening ? "L'assistant écoute..." : isThinking ? "L'assistant analyse..." : isSpeaking ? "L'assistant répond..." : "Cliquez sur le micro pour parler"}
        </p>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
