"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

interface Conversation {
  id: string;
  channel: string;
  subject: string;
  participant_name: string;
  participant_email: string;
  status: string;
  classification: string;
  last_message_at: string | null;
  created_at: string;
}

interface Message {
  id: string;
  direction: "inbound" | "outbound";
  sender_name: string;
  sender_email: string;
  body_text: string;
  sent_at: string | null;
  created_at: string;
}

const CHANNEL_LABELS: Record<string, string> = {
  all: "Tous",
  gmail: "Gmail",
  messenger: "Messenger",
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = diffMs / 3_600_000;
  if (diffH < 24) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (diffH < 48) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function InboxPage() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");

  // ── Conversations list ────────────────────────────────────────────────────
  const convQuery = useQuery<{ data: Conversation[]; total: number }>({
    queryKey: ["inbox", channelFilter],
    queryFn: () =>
      apiClient.get(
        channelFilter === "all"
          ? "/inbox/conversations?limit=50"
          : `/inbox/conversations?limit=50&channel=${channelFilter}`
      ),
    retry: false,
  });

  const conversations: Conversation[] = convQuery.data?.data ?? [];
  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  // ── Messages for selected conversation ───────────────────────────────────
  const msgQuery = useQuery<Message[]>({
    queryKey: ["inbox-messages", selectedId],
    queryFn: () => apiClient.get(`/inbox/conversations/${selectedId}/messages`),
    enabled: !!selectedId,
    retry: false,
  });

  const messages: Message[] = msgQuery.data ?? [];

  // ── Reply mutation ────────────────────────────────────────────────────────
  const replyMutation = useMutation({
    mutationFn: (body: string) =>
      apiClient.post(`/inbox/conversations/${selectedId}/reply`, { body }),
    onSuccess: () => {
      setReply("");
      qc.invalidateQueries({ queryKey: ["inbox-messages", selectedId] });
      qc.invalidateQueries({ queryKey: ["inbox", channelFilter] });
    },
  });

  const handleSend = () => {
    if (!reply.trim() || !selectedId) return;
    replyMutation.mutate(reply.trim());
  };

  return (
    <div className="flex h-full overflow-hidden bg-[--color-bg]">
      {/* ── Conversation List ─────────────────────────────────────────────── */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r border-[--color-border] bg-[--color-surface]">
        <div className="px-6 py-5 border-b border-[--color-border]">
          <h1 className="text-xl font-medium font-serif text-[--color-text]">Inbox</h1>
          <p className="text-xs text-[--color-text-secondary] mt-1">
            {convQuery.data?.total ?? conversations.length} conversations
          </p>

          {/* Channel filter tabs */}
          <div className="flex gap-1 mt-3">
            {Object.entries(CHANNEL_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setChannelFilter(key)}
                className={cn(
                  "px-3 py-1 text-xs rounded-full border transition-all",
                  channelFilter === key
                    ? "bg-[--color-cta] border-[--color-cta] text-white"
                    : "border-[--color-border] text-[--color-text-secondary] hover:border-[--color-cta]"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {convQuery.isLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : conversations.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-[--color-text-secondary]">
              Aucune conversation.
              <br />
              <span className="text-xs mt-1 block">Connectez votre Gmail dans les Paramètres.</span>
            </div>
          ) : (
            <div className="divide-y divide-[--color-border-subtle]">
              {conversations.map((conv) => (
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
                      {conv.participant_name || conv.participant_email.split("@")[0]}
                    </p>
                    <span className="text-[10px] text-[--color-text-tertiary] font-medium">
                      {formatDate(conv.last_message_at ?? conv.created_at)}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[--color-text] truncate mb-1">
                    {conv.subject}
                  </p>
                  <div className="flex items-center gap-2">
                    {conv.classification && conv.classification !== "UNCLASSIFIED" && (
                      <Badge color={CLASSIFICATION_COLOR[conv.classification] ?? "default"}>
                        {conv.classification.toLowerCase()}
                      </Badge>
                    )}
                    {conv.channel !== "gmail" && (
                      <Badge color="default">{conv.channel}</Badge>
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
                  <p className="text-xs text-[--color-text-secondary] mt-0.5">
                    {selected.participant_name
                      ? `${selected.participant_name} <${selected.participant_email}>`
                      : selected.participant_email}
                  </p>
                </div>
                <div className="flex gap-2">
                  {selected.classification && selected.classification !== "UNCLASSIFIED" && (
                    <Badge color={CLASSIFICATION_COLOR[selected.classification] ?? "default"}>
                      {selected.classification.toLowerCase()}
                    </Badge>
                  )}
                  <Button variant="secondary" size="sm">Fermer</Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-12 py-8 space-y-8 custom-scrollbar">
                {msgQuery.isLoading ? (
                  <div className="flex justify-center py-10"><Spinner /></div>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-center text-[--color-text-secondary]">Aucun message.</p>
                ) : (
                  messages.map((msg) => {
                    const isOutbound = msg.direction === "outbound";
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex flex-col max-w-[80%]",
                          isOutbound ? "ml-auto items-end" : "ml-0"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[--color-text-tertiary]">
                            {isOutbound ? "Vous" : (msg.sender_name || selected.participant_email.split("@")[0])}
                          </span>
                          <span className="text-[10px] text-[--color-text-tertiary]">
                            • {formatDate(msg.sent_at ?? msg.created_at)}
                          </span>
                        </div>
                        <div className={cn(
                          "rounded-2xl px-5 py-4 text-[15px] leading-relaxed shadow-sm border whitespace-pre-wrap",
                          isOutbound
                            ? "bg-[--color-bg] border-[--color-border-warm] text-[--color-text]"
                            : "bg-[--color-surface] border-[--color-border] text-[--color-text]"
                        )}>
                          {msg.body_text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reply Composer */}
              <div className="px-8 py-6 border-t border-[--color-border] bg-[--color-surface]">
                <div className="max-w-4xl mx-auto border border-[--color-border] rounded-2xl bg-[--color-bg] shadow-sm flex flex-col p-4">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
                    }}
                    className="w-full bg-transparent outline-none text-sm resize-none mb-4"
                    placeholder={`Répondre à ${selected.participant_name || selected.participant_email.split("@")[0]}…`}
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[--color-text-tertiary]">⌘↵ pour envoyer</span>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!reply.trim() || replyMutation.isPending}
                      onClick={handleSend}
                    >
                      {replyMutation.isPending ? <Spinner size={14} /> : "Envoyer"}
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
              <h2 className="text-xl font-medium font-serif text-[--color-text] mb-2">
                Sélectionnez une conversation
              </h2>
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
