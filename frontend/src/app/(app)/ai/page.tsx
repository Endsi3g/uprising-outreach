"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAIChat } from "@/store/useAIChat";
import { AI_MODELS, type ToolResultEvent, type ToolUseEvent } from "@/types/ai";
import { ModelSelector } from "@/components/ai/ModelSelector";
import { ToolResultCard } from "@/components/ai/ToolResultCard";
import { apiClient } from "@/lib/api";
import type { Conversation } from "@/types/ai";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export default function AIPage() {
  const {
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
    conversations,
    setConversations,
  } = useAIChat();

  const [input, setInput] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load conversation history
  useEffect(() => {
    setLoadingConvs(true);
    apiClient
      .get<Conversation[]>("/ai/conversations")
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoadingConvs(false));
  }, [setConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        appendAssistantChunk("Erreur de connexion au serveur AI.");
        finalizeAssistantMessage();
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        for (const line of text.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;
          try {
            const event = JSON.parse(raw);
            switch (event.t) {
              case "meta":
                if (event.conversation_id) {
                  setActiveConversation(event.conversation_id);
                  // Refresh conversation list
                  apiClient.get<Conversation[]>("/ai/conversations").then(setConversations).catch(() => {});
                }
                break;
              case "text": appendAssistantChunk(event.v ?? ""); break;
              case "tool_use": addToolUse(event as ToolUseEvent); break;
              case "tool_result": addToolResult(event as ToolResultEvent); break;
              case "done": finalizeAssistantMessage(); break;
              case "error":
                appendAssistantChunk(`\n\n⚠️ ${event.message}`);
                finalizeAssistantMessage();
                break;
            }
          } catch { /* skip */ }
        }
      }
    } catch {
      appendAssistantChunk("Impossible de joindre le serveur. Vérifiez que le backend est démarré.");
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
    <div className="flex h-full bg-[--color-bg]">
      {/* ── Conversation history sidebar ──────────────────────────────── */}
      <aside className="w-[240px] flex-shrink-0 border-r border-[--color-border] flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-4 border-b border-[--color-border]">
          <span className="text-xs font-bold uppercase tracking-widest text-[--color-text-tertiary]">
            Historique
          </span>
          <button
            onClick={clearMessages}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[--color-surface-2] text-[--color-text-tertiary] hover:text-[--color-text] transition-all"
            title="Nouvelle conversation"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
          {loadingConvs && (
            <div className="px-4 py-8 text-center text-xs text-[--color-text-tertiary]">Chargement…</div>
          )}
          {!loadingConvs && conversations.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-[--color-text-tertiary]">Aucune conversation</div>
          )}
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                setActiveConversation(conv.id);
                clearMessages();
                // Load messages for this conversation
                apiClient
                  .get<{ role: string; content: string }[]>(`/ai/conversations/${conv.id}/messages`)
                  .then((msgs) => {
                    msgs.forEach((m) => {
                      if (m.role === "user") addUserMessage(m.content);
                      else {
                        appendAssistantChunk(m.content);
                        finalizeAssistantMessage();
                      }
                    });
                  })
                  .catch(() => {});
              }}
              className={cn(
                "w-full px-4 py-2.5 text-left hover:bg-[--color-surface-2] transition-colors",
                activeConversationId === conv.id && "bg-[--color-surface]"
              )}
            >
              <p className="text-xs font-medium truncate text-[--color-text]">
                {conv.title ?? "Conversation"}
              </p>
              <p className="text-[10px] text-[--color-text-tertiary] mt-0.5">
                {new Date(conv.updated_at).toLocaleDateString("fr-CA")} · {conv.model.replace("claude-", "").replace("-4-6", " 4.6").replace("-4-5", " 4.5")}
              </p>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main chat area ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-[--color-border] flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[--color-cta]">✺</span>
            <h1 className="text-base font-serif font-medium text-[--color-text]">ProspectOS AI</h1>
          </div>
          <ModelSelector model={model} onChange={setModel} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6 max-w-3xl mx-auto w-full space-y-6">
          {messages.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="text-4xl">✺</div>
              <h2 className="text-2xl font-serif text-[--color-text]">Comment puis-je vous aider?</h2>
              <p className="text-sm text-[--color-text-secondary]">
                Je peux rechercher des leads, analyser votre pipeline, scorer des contacts, et bien plus.
              </p>
              <div className="flex flex-wrap gap-2 justify-center pt-4">
                {[
                  "Montre-moi les leads chauds cette semaine",
                  "Donne-moi les stats de mon pipeline",
                  "Score les leads du segment SaaS",
                  "Enrichis les leads sans email",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                    className="text-sm px-4 py-2 rounded-xl border border-[--color-border] text-[--color-text-secondary] hover:border-[--color-cta] hover:text-[--color-cta] transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col gap-3",
                msg.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed whitespace-pre-wrap",
                  msg.role === "user"
                    ? "bg-[--color-cta] text-white rounded-br-sm"
                    : "bg-[--color-surface-2] text-[--color-text] rounded-bl-sm border border-[--color-border]"
                )}
              >
                {msg.content}
                {msg.streaming && (
                  <span className="inline-flex ml-1.5 gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1 h-1 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </span>
                )}
              </div>

              {msg.tool_uses?.map((tu) => {
                const result = msg.tool_results?.find((r) => r.call_id === tu.call_id);
                return <ToolResultCard key={tu.call_id} toolUse={tu} toolResult={result} />;
              })}
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 px-8 pb-6 pt-2 max-w-3xl mx-auto w-full">
          <div className="flex items-end gap-3 bg-[--color-surface] border border-[--color-border] rounded-2xl p-3 focus-within:border-[--color-cta] transition-colors shadow-sm">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez un message… (Entrée pour envoyer)"
              rows={1}
              disabled={isStreaming}
              className="flex-1 bg-transparent text-sm text-[--color-text] placeholder:text-[--color-text-tertiary] resize-none outline-none leading-relaxed max-h-40 overflow-y-auto"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-[--color-cta] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[--color-cta-hover] transition-all flex-shrink-0"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-[--color-text-tertiary] text-center mt-2">
            ProspectOS AI peut faire des erreurs. Vérifiez les informations importantes.
          </p>
        </div>
      </div>
    </div>
  );
}
