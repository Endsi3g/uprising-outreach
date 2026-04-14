"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VoiceVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
}

export function VoiceVisualizer({ isListening, isSpeaking, isThinking }: VoiceVisualizerProps) {
  return (
    <div className="relative flex items-center justify-center w-full h-80">
      {/* Background Glow */}
      <motion.div
        animate={{
          scale: isListening || isSpeaking ? [1, 1.2, 1] : 1,
          opacity: isListening || isSpeaking ? [0.15, 0.25, 0.15] : 0.1,
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-r from-[--color-cta] to-orange-400 rounded-full blur-[100px]"
      />

      {/* The Core Orb */}
      <div className="relative w-48 h-48">
        <AnimatePresence>
          {isThinking && (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1, rotate: 360 }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
             />
          )}
        </AnimatePresence>

        <motion.div
          animate={{
            scale: isListening ? [1, 1.1, 1] : isSpeaking ? [1, 1.05, 1] : 1,
            boxShadow: isListening 
              ? "0 0 60px rgba(201, 100, 66, 0.4)" 
              : isSpeaking 
                ? "0 0 30px rgba(201, 100, 66, 0.2)" 
                : "0 0 20px rgba(201, 100, 66, 0.1)",
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "relative w-full h-full rounded-full bg-white flex items-center justify-center p-8 transition-colors",
            "border border-[--color-border-warm] shadow-whisper overflow-hidden"
          )}
        >
          {/* Internal Swirls / Textures */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,var(--color-cta),transparent)]" />
          
          {/* The Spirit Symbol */}
          <motion.span 
            animate={{ 
                rotate: isListening ? 360 : 0,
                scale: isThinking ? [1, 0.9, 1] : 1
            }}
            transition={{ 
                rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity }
            }}
            className="text-6xl text-[--color-cta] font-serif select-none"
          >
            ✺
          </motion.span>
        </motion.div>

        {/* Outer Ring 1 */}
        <motion.div
          animate={{
              scale: isListening ? [1, 1.4, 1] : 1,
              opacity: isListening ? [0.3, 0, 0.3] : 0,
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          className="absolute -inset-4 rounded-full border border-[--color-cta]/20"
        />
        
        {/* Outer Ring 2 */}
        <motion.div
          animate={{
              scale: isListening ? [1, 1.8, 1] : 1,
              opacity: isListening ? [0.1, 0, 0.1] : 0,
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
          className="absolute -inset-8 rounded-full border border-[--color-cta]/10"
        />
      </div>
    </div>
  );
}

import { AnimatePresence } from "framer-motion";
