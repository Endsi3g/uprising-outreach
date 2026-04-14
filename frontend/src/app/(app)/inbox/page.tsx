"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Badge, Button } from "@/components/ui";
import { Spinner } from "@/components/ui/Spinner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type ClassificationColor = "green" | "amber" | "red" | "blue" | "default";

const CLASSIFICATION_COLOR: Record<string, ClassificationColor> = {
  INTERESTED: "green",
  NOT_INTERESTED: "red",
  QUESTION: "blue",
  OUT_OF_OFFICE: "amber",
  BOUNCE: "red",
  REFERRAL: "green",
};

const MOCK_THREAD = [
  { id: 1, role: "assistant", content: "Bonjour Luc, j'ai vu votre profil LinkedIn et votre travail sur l'automatisation des ventes. Est-ce que vous seriez ouvert à en discuter ?", time: "Hier 14:00" },
  { id: 2, role: "lead", content: "Bonjour, oui pourquoi pas. Que proposez-vous exactement ?", time: "Hier 16:30" },
  { id: 3, role: "assistant", content: "Nous aidons les équipes comme la vôtre à automatiser le sourcing de leads qualifiés avec une approche personnalisée par IA. Seriez-vous disponible Jeudi matin pour un appel de 15 minutes ?", time: "Aujourd'hui 09:00" }
];

export default function InboxPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const { data, isLoading } = useQuery<{ data: any[] }>({
    queryKey: ["inbox"],
    queryFn: () => apiClient.get("/inbox/conversations?limit=50"),
    retry: false,
  });

  const conversations = data?.data ?? [
    { id: "1", receiver_email: "luc.richard@tech.com", subject: "Re: Automatisation des ventes", classification: "INTERESTED", received_at: new Date().toISOString() },
    { id: "2", receiver_email: "sarah.levy@corp.fr", subject: "Question sur vos tarifs", classification: "QUESTION", received_at: new Date().toISOString() }
  ];
  const selected = conversations.find((c: any) => c.id === selectedId);

  return (
    <div className="flex h-full overflow-hidden bg-[--color-bg]">
      {/* ── Conversation List ─────────────────────────────────────────────── */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r border-[--color-border] bg-[--color-surface]">
        <div className="px-6 py-5 border-b border-[--color-border]">
          <h1 className="text-xl font-medium font-serif text-[--color-text]">Inbox</h1>
          <p className="text-xs text-[--color-text-secondary] mt-1">
            {conversations.length} conversations actives
          </p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : (
            <div className="divide-y divide-[--color-border-subtle]">
              {conversations.map((conv: any) => (
                <motion.button
                  key={conv.id}
                  whileHover={{ backgroundColor: "var(--color-surface-2)" }}
                  onClick={() => setSelectedId(conv.id)}
                  className={cn(
                    "w-full px-6 py-4 text-left transition-all relative",
                    selectedId === conv.id ? "bg-[--color-surface-2]" : "bg-transparent"
                  )}
                >
                  {selectedId === conv.id && (
                    <motion.div 
                      layoutId="inbox-active-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-[--color-cta]" 
                    />
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold truncate text-[--color-text]">
                      {conv.receiver_email.split('@')[0]}
                    </p>
                    <span className="text-[10px] text-[--color-text-tertiary] font-medium">
                      {conv.received_at ? new Date(conv.received_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[--color-text] truncate mb-1">
                    {conv.subject}
                  </p>
                  <div className="flex items-center gap-2">
                    {conv.classification && (
                      <Badge color={CLASSIFICATION_COLOR[conv.classification] ?? "default"}>
                        {conv.classification.toLowerCase()}
                      </Badge>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Thread View ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[--color-bg]">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div 
              key={selected.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              {/* Thread Header */}
              <div className="px-8 py-5 border-b border-[--color-border] flex items-center justify-between bg-[--color-surface]">
                <div>
                  <h2 className="text-lg font-medium text-[--color-text] font-serif">{selected.subject}</h2>
                  <p className="text-xs text-[--color-text-secondary] mt-0.5">{selected.receiver_email}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">Assigner</Button>
                  <Button variant="secondary" size="sm">Fermer</Button>
                </div>
              </div>

              {/* Thread Messages */}
              <div className="flex-1 overflow-y-auto px-12 py-8 space-y-8 custom-scrollbar">
                {MOCK_THREAD.map((msg) => (
                  <div key={msg.id} className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.role === "assistant" ? "ml-0" : "ml-auto items-end"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[--color-text-tertiary]">
                        {msg.role === "assistant" ? "Vous" : selected.receiver_email.split('@')[0]}
                      </span>
                      <span className="text-[10px] text-[--color-text-tertiary]">• {msg.time}</span>
                    </div>
                    <div className={cn(
                      "rounded-2xl px-5 py-4 text-[15px] leading-relaxed shadow-sm border",
                      msg.role === "assistant" 
                        ? "bg-[--color-surface] border-[--color-border] text-[--color-text]" 
                        : "bg-[--color-bg] border-[--color-border-warm] text-[--color-text]"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Composer */}
              <div className="px-8 py-6 border-t border-[--color-border] bg-[--color-surface]">
                <div className="max-w-4xl mx-auto border border-[--color-border] rounded-2xl bg-[--color-bg] shadow-sm flex flex-col p-4">
                  <textarea 
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm resize-none mb-4"
                    placeholder="Répondre à Luc..."
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button 
                      variant="primary" 
                      size="sm"
                      disabled={!reply.trim()}
                      onClick={() => { setReply(""); /* Mock send */ }}
                    >
                      Envoyer la réponse
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[--color-surface-2] flex items-center justify-center text-2xl mb-6">
                📥
              </div>
              <h2 className="text-xl font-medium font-serif text-[--color-text] mb-2">Sélectionnez une conversation</h2>
              <p className="text-sm text-[--color-text-secondary] max-w-sm">
                Retrouvez ici tous les échanges avec vos prospects. L'IA classifie automatiquement l'intention des réponses.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
