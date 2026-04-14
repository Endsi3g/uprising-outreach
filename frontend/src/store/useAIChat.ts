import { create } from "zustand";
import type { AIModel, ChatMessage, Conversation, PageContext, ToolResultEvent, ToolUseEvent } from "@/types/ai";

interface AIChatState {
  // Sidebar visibility
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;

  // Active conversation
  activeConversationId: string | null;
  setActiveConversation: (id: string | null) => void;

  // Messages for the current session (in-memory, persisted to DB on backend)
  messages: ChatMessage[];
  addUserMessage: (content: string) => string;
  appendAssistantChunk: (text: string) => void;
  finalizeAssistantMessage: () => void;
  addToolUse: (event: ToolUseEvent) => void;
  addToolResult: (event: ToolResultEvent) => void;
  clearMessages: () => void;

  // Model selection
  model: AIModel;
  setModel: (model: AIModel) => void;

  // Streaming state
  isStreaming: boolean;
  setStreaming: (v: boolean) => void;

  // Conversation history (loaded from API)
  conversations: Conversation[];
  setConversations: (convs: Conversation[]) => void;

  // Page context injected by each page
  pageContext: PageContext | null;
  setPageContext: (ctx: PageContext | null) => void;

  // Global send message function
  sendMessage: (content: string) => Promise<void>;
}

let msgCounter = 0;
const nextId = () => `msg_${++msgCounter}`;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export const useAIChat = create<AIChatState>((set, get) => ({
  sidebarOpen: false,
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  activeConversationId: null,
  setActiveConversation: (id) => set({ activeConversationId: id }),

  messages: [],
  addUserMessage: (content) => {
    const id = nextId();
    set((s) => ({
      messages: [...s.messages, { id, role: "user", content }],
    }));
    return id;
  },
  appendAssistantChunk: (text) => {
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === "assistant" && last.streaming) {
        msgs[msgs.length - 1] = { ...last, content: last.content + text };
      } else {
        msgs.push({ id: nextId(), role: "assistant", content: text, streaming: true });
      }
      return { messages: msgs };
    });
  },
  finalizeAssistantMessage: () => {
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === "assistant" && last.streaming) {
        msgs[msgs.length - 1] = { ...last, streaming: false };
      }
      return { messages: msgs };
    });
  },
  addToolUse: (event) => {
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === "assistant") {
        const existing = last.tool_uses ?? [];
        msgs[msgs.length - 1] = { ...last, tool_uses: [...existing, event] };
      }
      return { messages: msgs };
    });
  },
  addToolResult: (event) => {
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === "assistant") {
        const existing = last.tool_results ?? [];
        msgs[msgs.length - 1] = { ...last, tool_results: [...existing, event] };
      }
      return { messages: msgs };
    });
  },
  clearMessages: () => set({ messages: [], activeConversationId: null }),

  model: "prospectos-ai-core",
  setModel: (model) => set({ model }),

  isStreaming: false,
  setStreaming: (v) => set({ isStreaming: v }),

  conversations: [],
  setConversations: (convs) => set({ conversations: convs }),

  pageContext: null,
  setPageContext: (ctx) => set({ pageContext: ctx }),

  sendMessage: async (content: string) => {
    const { 
      messages, 
      model, 
      activeConversationId, 
      pageContext, 
      addUserMessage,
      setStreaming,
      appendAssistantChunk,
      finalizeAssistantMessage,
      addToolUse,
      addToolResult,
      setActiveConversation
    } = get();

    if (!content.trim() || get().isStreaming) return;
    
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
            // skip
          }
        }
      }
    } catch (err) {
      appendAssistantChunk("Impossible de contacter le serveur.");
      finalizeAssistantMessage();
    } finally {
      setStreaming(false);
    }
  },
}));
