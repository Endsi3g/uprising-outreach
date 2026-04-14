"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ComposerPage() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleAction = (route: string) => {
    router.push(route);
  };

  const simulateResponse = async (userPrompt: string) => {
    setIsTyping(true);
    setMessages(prev => [...prev, { role: "user", content: userPrompt }]);
    setPrompt("");

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

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isTyping) return;
    simulateResponse(prompt);
  };

  return (
    <div className="flex flex-col h-full relative bg-[--color-surface] overflow-hidden">
      {/* Top Right Buttons Optional Area */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
        <button className="text-[--color-text-secondary] hover:text-[--color-text] transition-colors">◱</button>
        <button className="text-[--color-text-secondary] hover:text-[--color-text] transition-colors">⚙</button>
      </div>

      {/* Chat / Content Area */}
      <div 
        ref={scrollRef}
        className={cn(
          "flex-1 overflow-y-auto px-6 py-12 flex flex-col items-center custom-scrollbar",
          messages.length > 0 ? "justify-start" : "justify-center"
        )}
      >
        <div className="w-full max-w-[700px] space-y-8">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <motion.div
                key="greeting"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center mb-8"
              >
                <h1 
                  className="text-[2.2rem] font-medium flex items-center gap-3 text-center leading-tight"
                  style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}
                >
                  <span className="text-[--color-cta]">✺</span> Bon après-midi, Kael
                </h1>
              </motion.div>
            ) : (
              messages.map((msg, i) => (
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
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Composer Input Wrap */}
      <div className="w-full max-w-[760px] mx-auto pb-8 px-6 flex-shrink-0">
        <motion.div 
          layout
          className="rounded-2xl relative border border-[--color-border] bg-[--color-bg] shadow-[--shadow-whisper]"
        >
          <textarea
            className="w-full bg-transparent resize-none outline-none px-6 pt-5 pb-16 text-md"
            style={{ color: "var(--color-text)", minHeight: messages.length > 0 ? "80px" : "120px" }}
            placeholder="Comment puis-je vous aider ?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />

          {/* Bottom Toolbar within Composer */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-lg text-[--color-text-secondary] hover:bg-[--color-surface-2] hover:text-[--color-text] transition-all">
              +
            </button>

            <div className="flex items-center gap-4 text-xs font-medium text-[--color-text-secondary]">
              <span className="cursor-pointer hover:text-[--color-text] transition-colors">Sonnet 4.6 ⌄</span>
              <button 
                onClick={() => handleSubmit()}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                  prompt.trim() ? "bg-[--color-cta] text-white" : "bg-[--color-surface-2] text-[--color-text-tertiary]"
                )}
              >
                ↑
              </button>
            </div>
          </div>
        </motion.div>

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
                className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] border border-[--color-border] text-[--color-text-secondary] transition-colors"
              >
                <span className="text-[--color-text-tertiary] text-sm">{pill.icon}</span>
                {pill.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
