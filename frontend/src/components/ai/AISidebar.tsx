"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAIChat } from "@/store/useAIChat";
import { AI_MODELS, type AIModel, type ToolResultEvent, type ToolUseEvent } from "@/types/ai";
import { ModelSelector } from "./ModelSelector";
import { ToolResultCard } from "./ToolResultCard";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function AISidebar() {
  const {
    sidebarOpen,
    closeSidebar,
    messages,
    addUserMessage,
    appendAssistantChunk,
    finalizeAssistantMessage,
    addToolUse,
    addToolResult,
    clearMessages,
    model,
    setModel,
    isStreaming,
    setStreaming,
    activeConversationId,
    setActiveConversation,
    pageContext,
  } = useAIChat();

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        useAIChat.getState().toggleSidebar();
      }
      if (e.key === "Escape" && sidebarOpen) {
        closeSidebar();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [sidebarOpen, closeSidebar]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (sidebarOpen) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [sidebarOpen]);

  async function sendMessage() {
    const content = input.trim();
    if (!content || isStreaming) return;
    setInput("");
    addUserMessage(content);
    setStreaming(true);

    const token = getToken();
    const body = JSON.stringify({
      model,
      messages: [
        ...messages
          .filter((m) => !m.streaming)
          .map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content },
      ],
      conversation_id: activeConversationId,
      page_context: pageContext ?? undefined,
      tools_enabled: true,
    });

    try {
      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body,
      });

      if (!res.ok || !res.body) {
        appendAssistantChunk("Erreur lors de la connexion au serveur AI.");
        finalizeAssistantMessage();
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const event = JSON.parse(raw);
            switch (event.t) {
              case "meta":
                if (event.conversation_id) setActiveConversation(event.conversation_id);
                break;
              case "text":
                appendAssistantChunk(event.v ?? "");
                break;
              case "tool_use":
                addToolUse(event as ToolUseEvent);
                break;
              case "tool_result":
                addToolResult(event as ToolResultEvent);
                break;
              case "done":
                finalizeAssistantMessage();
                break;
              case "error":
                appendAssistantChunk(`\n\n⚠️ ${event.message}`);
                finalizeAssistantMessage();
                break;
            }
          } catch {
            // malformed SSE chunk — skip
          }
        }
      }
    } catch (err) {
      appendAssistantChunk("Impossible de contacter le serveur. Vérifiez que le backend est démarré.");
      finalizeAssistantMessage();
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/10"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            key="ai-sidebar"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex flex-col w-[420px] bg-[--color-bg] border-l border-[--color-border] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[--color-border] flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-[--color-cta] text-base">✺</span>
                <span className="text-sm font-medium font-serif text-[--color-text]">
                  ProspectOS AI
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ModelSelector model={model} onChange={setModel} />
                <button
                  onClick={clearMessages}
                  title="Nouvelle conversation"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[--color-text-tertiary] hover:text-[--color-text] hover:bg-[--color-surface-2] transition-all"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
                <button
                  onClick={closeSidebar}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[--color-text-tertiary] hover:text-[--color-text] hover:bg-[--color-surface-2] transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 space-y-4">
              {messages.length === 0 && (
                <div className="py-12 text-center space-y-3">
                  <div className="text-3xl">✺</div>
                  <p className="text-sm text-[--color-text-secondary] font-serif">
                    Comment puis-je vous aider?
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center pt-2">
                    {[
                      "Montre-moi mes leads chauds",
                      "Stats du pipeline",
                      "Score mes leads SaaS",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setInput(suggestion);
                          textareaRef.current?.focus();
                        }}
                        className="text-xs px-3 py-1.5 rounded-full border border-[--color-border] text-[--color-text-secondary] hover:border-[--color-cta] hover:text-[--color-cta] transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex flex-col gap-2", msg.role === "user" ? "items-end" : "items-start")}>
                  {/* Bubble */}
                  <div
                    className={cn(
                      "max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                      msg.role === "user"
                        ? "bg-[--color-cta] text-white rounded-br-sm"
                        : "bg-[--color-surface-2] text-[--color-text] rounded-bl-sm border border-[--color-border]"
                    )}
                  >
                    {msg.content}
                    {msg.streaming && (
                      <span className="inline-flex ml-1 gap-0.5">
                        <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    )}
                  </div>

                  {/* Tool cards */}
                  {msg.tool_uses?.map((tu) => {
                    const result = msg.tool_results?.find((r) => r.call_id === tu.call_id);
                    return <ToolResultCard key={tu.call_id} toolUse={tu} toolResult={result} />;
                  })}
                </div>
              ))}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-[--color-border]">
              <div className="flex items-end gap-2 bg-[--color-surface] border border-[--color-border] rounded-xl p-2 focus-within:border-[--color-cta] transition-colors">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message… (Entrée pour envoyer, Shift+Entrée pour saut de ligne)"
                  rows={1}
                  disabled={isStreaming}
                  className="flex-1 bg-transparent text-sm text-[--color-text] placeholder:text-[--color-text-tertiary] resize-none outline-none leading-relaxed max-h-32 overflow-y-auto"
                  style={{ fieldSizing: "content" } as React.CSSProperties}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isStreaming}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[--color-cta] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[--color-cta-hover] transition-all flex-shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
              <p className="text-[10px] text-[--color-text-tertiary] text-center mt-1.5">
                ⌘K pour ouvrir · Échap pour fermer
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
