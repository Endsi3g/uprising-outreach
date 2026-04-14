"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, AlertCircle } from "lucide-react";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { Button } from "@/components/ui/Button";
import { speak } from "@/lib/elevenlabs";
import { useAIChat } from "@/store/useAIChat";
import { cn } from "@/lib/utils";

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: (event: any) => void;
}

export function VoiceAssistant() {
  const { messages, isStreaming, sendMessage, clearMessages } = useAIChat();
  
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastProcessedMessageId, setLastProcessedMessageId] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "fr-CA";

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
      };

      recognition.onend = () => {
        setIsListening(false);
        // If we have a transcript, send it!
        setTranscript((prev) => {
          if (prev.trim()) {
            handleSendVoiceMessage(prev);
          }
          return prev;
        });
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleSendVoiceMessage = async (text: string) => {
    await sendMessage(text);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Logic to handle AI Response (TTS + NanoClaw feedback)
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage?.role === "assistant" && !lastMessage.streaming && lastMessage.id !== lastProcessedMessageId) {
      setLastProcessedMessageId(lastMessage.id);
      
      const hasNanoClaw = lastMessage.tool_uses?.some(tu => tu.name === "perform_autonomous_action");
      
      let textToSpeak = lastMessage.content;
      if (hasNanoClaw) {
        textToSpeak = "D'accord, je lance un agent autonome pour analyser cela. " + textToSpeak;
      }

      if (!isMuted && textToSpeak) {
        speak(textToSpeak);
      }
    }
  }, [messages, isMuted, lastProcessedMessageId]);

  const lastAssistantMessage = [...messages].reverse().find(m => m.role === "assistant");
  const isAssistantThinking = isStreaming && lastAssistantMessage?.streaming;
  const isAssistantSpeaking = false; // elevenlabs-js doesn't provide easy 'isSpeaking' callback in this simple fetch wrapper

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[--color-bg] to-[--color-surface] overflow-hidden">
      <div className="max-w-2xl w-full flex flex-col items-center">
        
        {/* Visualizer Area */}
        <VoiceVisualizer 
            isListening={isListening} 
            isSpeaking={false} // Would need more plumbing for real ElevenLabs duration
            isThinking={isStreaming} 
        />

        {/* Dynamic Transcript/Response Area */}
        <div className="h-48 flex flex-col items-center text-center space-y-6 z-10">
          <AnimatePresence mode="wait">
            {isListening && transcript && (
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
            {!isListening && lastAssistantMessage && (
                <motion.div
                    key="response"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                >
                    <p className="text-xl font-serif text-[--color-text] leading-relaxed max-w-xl line-clamp-4">
                        {lastAssistantMessage.content}
                    </p>
                    
                    {lastAssistantMessage.tool_uses?.some(tu => tu.name === "perform_autonomous_action") && (
                        <div className="flex items-center justify-center gap-2">
                             <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-400 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 animate-pulse">
                                <AlertCircle size={10} />
                                Agent NanoClaw Actif
                             </span>
                        </div>
                    )}
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="mt-12 flex items-center gap-8">
            <button 
                onClick={() => { clearMessages(); setTranscript(""); }}
                className="p-4 rounded-full text-[--color-text-tertiary] hover:bg-[--color-surface-2] transition-colors"
                title="Reinitialiser la conversation"
            >
                <RotateCcw size={20} />
            </button>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleListening}
                disabled={isStreaming}
                className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all relative overflow-hidden",
                    isListening ? "bg-red-500 text-white shadow-red-500/20" : "bg-[--color-cta] text-white shadow-[--color-cta]/20",
                    isStreaming && "opacity-50 cursor-not-allowed"
                )}
            >
                {isListening ? <MicOff size={36} /> : <Mic size={36} />}
                
                {isListening && (
                    <motion.div 
                        layoutId="active-ring"
                        className="absolute inset-0 border-4 border-white/30 rounded-full"
                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                )}
            </motion.button>

            <button 
                onClick={() => setIsMuted(!isMuted)}
                className={cn(
                    "p-4 rounded-full transition-colors",
                    isMuted ? "text-red-400 bg-red-400/10" : "text-[--color-text-tertiary] hover:bg-[--color-surface-2]"
                )}
                title={isMuted ? "Activer le son" : "Couper le son"}
            >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
        </div>

        <p className="mt-8 text-xs text-[--color-text-tertiary] font-medium uppercase tracking-widest opacity-60">
            {isListening ? "Je vous écoute..." : isStreaming ? "Analyse en cours..." : "Cliquez pour discuter avec ProspectOS"}
        </p>
      </div>
    </div>
  );
}
