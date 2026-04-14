import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: string;
}

interface ChatStore {
  sessions: ChatSession[];
  activeSessionId: string | null;
  
  // Actions
  addSession: (title?: string) => string;
  addMessage: (sessionId: string, message: Message) => void;
  setActiveSession: (id: string | null) => void;
  deleteSession: (id: string) => void;
  clearHistory: (sessionId: string) => void;
  renameSession: (id: string, title: string) => void;
  getActiveSession: () => ChatSession | undefined;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,

      addSession: (title) => {
        const id = uuidv4();
        const newSession: ChatSession = {
          id,
          title: title || "Nouvelle Discussion",
          messages: [],
          model: "Sonnet 4.6",
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activeSessionId: id,
        }));
        return id;
      },

      addMessage: (sessionId, message) => {
        set((state) => ({
          sessions: state.sessions.map((s) => 
            s.id === sessionId 
              ? { ...s, messages: [...s.messages, message] }
              : s
          ),
        }));
      },

      setActiveSession: (id) => set({ activeSessionId: id }),

      deleteSession: (id) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
          activeSessionId: state.activeSessionId === id ? null : state.activeSessionId,
        }));
      },

      clearHistory: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.map((s) => 
            s.id === sessionId ? { ...s, messages: [] } : s
          ),
        }));
      },

      renameSession: (id, title) => {
        set((state) => ({
          sessions: state.sessions.map((s) => 
            s.id === id ? { ...s, title } : s
          ),
        }));
      },

      getActiveSession: () => {
        const { sessions, activeSessionId } = get();
        return sessions.find((s) => s.id === activeSessionId);
      },
    }),
    {
      name: 'prospectos-chat-storage',
    }
  )
);
