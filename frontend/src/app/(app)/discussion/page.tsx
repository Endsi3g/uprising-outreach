"use client";

import { useChatStore } from "@/store/chat";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Trash2, Clock, Search, ChevronRight, PlusCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DiscussionHistoryPage() {
    const { sessions, deleteSession, setActiveSession, addSession } = useChatStore();
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const filteredSessions = sessions.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSessionClick = (id: string) => {
        setActiveSession(id);
        router.push("/");
    };

    const handleNewSession = () => {
        const id = addSession();
        router.push("/");
    };

    return (
        <div className="flex flex-col h-full bg-[--color-background] p-8 max-w-5xl mx-auto">
            <header className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-3xl font-serif font-medium text-[--color-text] mb-2">Historique des discussions</h1>
                    <p className="text-[--color-text-tertiary] text-sm">Retrouvez toutes vos interactions passées avec ProspectOS.</p>
                </div>
                <button 
                    onClick={handleNewSession}
                    className="flex items-center gap-2 px-4 py-2 bg-[--color-cta] text-white rounded-full font-medium shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                    <PlusCircle className="w-4 h-4" />
                    Nouvelle prospection
                </button>
            </header>

            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-text-tertiary]" />
                <input 
                    type="text" 
                    placeholder="Rechercher une discussion..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[--color-surface] border border-[--color-border] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[--color-cta]/30 transition-all shadow-sm"
                />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {filteredSessions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredSessions.map((session) => (
                                <motion.div
                                    key={session.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group relative bg-[--color-surface] border border-[--color-border] rounded-2xl p-5 hover:border-[--color-cta]/30 transition-all shadow-sm cursor-pointer"
                                    onClick={() => handleSessionClick(session.id)}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-[--color-surface-2] flex items-center justify-center text-[--color-cta]">
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                                            className="p-2 text-[--color-text-tertiary] hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <h3 className="text-[15px] font-medium text-[--color-text] mb-1 line-clamp-1">{session.title}</h3>
                                    <p className="text-xs text-[--color-text-tertiary] mb-4 line-clamp-2 min-h-[32px]">
                                        {session.messages[session.messages.length - 1]?.content || "Aucun message"}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-[--color-border-subtle]">
                                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-[--color-text-tertiary]">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true, locale: fr })}
                                        </div>
                                        <div className="text-[10px] font-bold text-[--color-text-tertiary] bg-[--color-surface-2] px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                            {session.messages.length} messages
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-full bg-[--color-surface-2] flex items-center justify-center text-[--color-text-tertiary] mb-4">
                                <Search className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-medium text-[--color-text]">Aucune discussion trouvée</h3>
                            <p className="text-[--color-text-tertiary] text-sm max-w-xs mx-auto mt-1">Essayez une autre recherche ou commencez une nouvelle prospection.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
