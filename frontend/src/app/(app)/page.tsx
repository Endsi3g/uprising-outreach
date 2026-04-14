"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

import { ClaudeChatInput, FileWithPreview, PastedContent } from "@/components/ui/ClaudeChatInput";
import { StatsSummary } from "@/components/ui/StatsSummary";
import { useAIChat } from "@/store/useAIChat";

export default function ComposerPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toggleSidebar } = useAIChat();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleAction = (route: string) => {
    router.push(route);
  };

  const simulateResponse = async (userPrompt: string, files?: FileWithPreview[], pasted?: PastedContent[]) => {
    setIsTyping(true);
    setMessages(prev => [...prev, { role: "user", content: userPrompt }]);

    // Simulate think time
    await new Promise(r => setTimeout(r, 800));

    const fullResponse = "Certainement. J'ai analysé votre demande. Je peux vous aider à segmenter ces prospects sur Montréal ou à préparer une séquence d'approche personnalisée. Que voulez-vous faire en premier ?";
    let currentResponse = "";
    
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    for (let i = 0; i < fullResponse.length; i++) {
      currentResponse += fullResponse[i];
      setMessages(prev => {
        const last = [...prev];
        last[last.length - 1] = { role: "assistant", content: currentResponse };
        return last;
      });
      await new Promise(r => setTimeout(r, 20 + Math.random() * 20));
    }
    
    setIsTyping(false);
  };

  const handleSendMessage = (message: string, files: FileWithPreview[], pastedContent: PastedContent[]) => {
    simulateResponse(message, files, pastedContent);
  };

  return (
    <div className={cn("flex flex-col h-full relative bg-[--color-surface] overflow-hidden", messages.length === 0 && "items-center justify-center")}>
      {/* Top Right Buttons Optional Area */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
        <button onClick={() => toggleSidebar()} className="text-[--color-text-secondary] hover:text-[--color-text] transition-colors" title="Ouvrir l'assistant AI">◱</button>
        <button onClick={() => handleAction("/settings")} className="text-[--color-text-secondary] hover:text-[--color-text] transition-colors" title="Paramètres">⚙</button>
      </div>

      {messages.length === 0 && (
        <motion.div
            key="greeting"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center mb-6"
        >
            <h1 
                className="text-[2.2rem] font-medium flex items-center gap-3 text-center leading-tight mb-2"
                style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}
            >
                <span className="text-[--color-cta]">✺</span> Bon après-midi, Kael
            </h1>
            <StatsSummary />
        </motion.div>
      )}

      {/* Chat / Content Area */}
      {messages.length > 0 && (
        <div 
            ref={scrollRef}
            className="flex-1 w-full overflow-y-auto px-6 py-12 flex flex-col items-center custom-scrollbar justify-start"
        >
            <div className="w-full max-w-[800px] space-y-8">
            <AnimatePresence mode="popLayout">
                {messages.map((msg, i) => (
                    <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "flex flex-col max-w-[85%] space-y-2",
                        msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                    >
                    <div 
                        className={cn(
                        "px-4 py-3 rounded-2xl text-[15px] leading-relaxed",
                        msg.role === "user" 
                            ? "bg-[--color-surface-2] text-[--color-text] border border-[--color-border]" 
                            : "text-[--color-text]"
                        )}
                    >
                        {msg.content || (msg.role === "assistant" && <span className="animate-pulse">...</span>)}
                    </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            </div>
        </div>
      )}

      {/* Composer Input Wrap */}
      <div className={cn("w-full max-w-[760px] mx-auto px-6 flex-shrink-0 relative z-10", messages.length > 0 && "pb-8")}>
        <ClaudeChatInput
          onSendMessage={handleSendMessage}
          placeholder="Comment puis-je vous aider ?"
        />

        {/* Quick Actions / Pills - only show on first screen */}
        {messages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-6"
          >
            {[
              { icon: "🎯", label: "Leads", action: "/leads" },
              { icon: "✉️", label: "Écrire", action: "/campaigns" },
              { icon: "🔄", label: "Stratégiser", action: "/pipeline" },
              { icon: "📥", label: "Depuis Inbox", action: "/inbox" }
            ].map((pill, i) => (
              <motion.button
                key={i}
                whileHover={{ backgroundColor: "var(--color-surface-2)", scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAction(pill.action)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium tracking-tight border border-[--color-border] text-[--color-text-secondary] hover:text-[--color-text] hover:border-[--color-text-tertiary] transition-all bg-[--color-bg]/50"
              >
                <span className="text-[14px] flex items-center justify-center h-4 w-4">{pill.icon}</span>
                <span className="leading-none">{pill.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
