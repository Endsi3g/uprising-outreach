"use client";

import { useEffect, useRef, useCallback, useTransition, useState } from "react";
import { cn } from "@/lib/utils";
import {
    LayoutGrid,
    CircleUserRound,
    ArrowUpIcon,
    PlusIcon,
    SendIcon,
    XIcon,
    LoaderIcon,
    Sparkles,
    Command,
    Zap,
    Mic,
    ChevronDown,
    AudioLines,
    Mail,
    Calendar,
    PenTool as Pen,
    Paperclip as Clip,
    Square
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react"
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useChatStore, Message } from "@/store/chat";
import gsap from "gsap";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface CommandSuggestion {
    icon: React.ReactNode;
    label: string;
    description: string;
    prefix: string;
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    
    return (
      <div className={cn(
        "relative",
        containerClassName
      )}>
        <textarea
          className={cn(
            "flex min-h-[40px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-[--color-text-tertiary]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {showRing && isFocused && (
          <motion.span 
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-[--color-cta]/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

function Spinner({ size = 16 }: { size?: number }) {
    return <LoaderIcon className="animate-spin" style={{ width: size, height: size }} />;
}

function CommandChip({ icon, label, isActive }: { icon: React.ReactNode, label: string, isActive?: boolean }) {
    return (
        <button className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-[11px] font-medium",
            isActive 
                ? "bg-[--color-cta] text-white border-[--color-cta] shadow-sm" 
                : "bg-[--color-surface-2]/50 hover:bg-[--color-surface-2] border-[--color-border-subtle] text-[--color-text-secondary]"
        )}>
            <span className={cn("opacity-80", isActive ? "text-white" : "")}>{icon}</span>
            {label}
        </button>
    );
}

function ChatWaveform({ isActive }: { isActive: boolean }) {
    return (
        <div className="flex items-center gap-0.5 px-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <motion.div
                    key={i}
                    animate={{
                        height: isActive 
                            ? [8, 16, 12, 20, 10, 14, 8][i % 7] 
                            : 4
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 0.8,
                        delay: i * 0.1,
                        ease: "easeInOut"
                    }}
                    className={cn(
                        "w-0.5 rounded-full",
                        isActive ? "bg-[--color-cta]" : "bg-[--color-text-tertiary]/30"
                    )}
                />
            ))}
        </div>
    );
}

export function AnimatedAIChat() {
    const router = useRouter();
    const { 
        sessions, 
        activeSessionId, 
        addSession, 
        addMessage, 
        setActiveSession,
        getActiveSession,
        clearHistory
    } = useChatStore();

    const [value, setValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 40,
        maxHeight: 200,
    });
    
    const containerRef = useRef<HTMLDivElement>(null);
    const messagesRef = useRef<HTMLDivElement>(null);
    const commandPaletteRef = useRef<HTMLDivElement>(null);
    const modelDropdownRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeSession = getActiveSession();
    const messages = activeSession?.messages || [];
    const models = ["Sonnet 4.6", "Haiku 4.1", "Opus 4.5", "GPT-4o", "O1-preview"];

    // GSAP Staggered Entrance
    useEffect(() => {
        if (messages.length === 1 && messagesRef.current) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    messagesRef.current!.children,
                    { opacity: 0, y: 15 },
                    { 
                        opacity: 1, 
                        y: 0, 
                        duration: 0.4, 
                        stagger: 0.08, 
                        ease: "power2.out",
                        overwrite: "auto"
                    }
                );
            });
            return () => ctx.revert();
        }
    }, [messages.length]); // Only stagger on first load or brand new conversation

    // Ensure we have a session on mount
    useEffect(() => {
        if (!activeSessionId && sessions.length === 0) {
            addSession();
        } else if (!activeSessionId && sessions.length > 0) {
            setActiveSession(sessions[0].id);
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, isThinking]);

    const commandSuggestions: CommandSuggestion[] = [
        { 
            icon: <Mail className="w-4 h-4" />, 
            label: "Cold Email", 
            description: "Rédiger un email de prospection (1 CTA, peer-to-peer)", 
            prefix: "/email" 
        },
        { 
            icon: <Sparkles className="w-4 h-4" />, 
            label: "Find Leads", 
            description: "Rechercher des leads sur Maps via Apify", 
            prefix: "/find-leads" 
        },
        { 
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
            ), 
            label: "Clone UI", 
            description: "Generate a UI from a screenshot", 
            prefix: "/clone" 
        },
        { 
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H15.5A3.5 3.5 0 0 1 19 5.5V18.5A3.5 3.5 0 0 1 15.5 22H8.5A3.5 3.5 0 0 1 5 18.5V5.5Z"/><path d="M8.5 2V12.25L12 8.75L15.5 12.25V2"/><circle cx="12" cy="15.5" r="3.5"/>
              </svg>
            ), 
            label: "Import Figma", 
            description: "Import a design from Figma", 
            prefix: "/figma" 
        },
        { 
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            ), 
            label: "Create Page", 
            description: "Generate a new web page", 
            prefix: "/page" 
        },
        { 
            icon: <Sparkles className="w-4 h-4" />, 
            label: "Improve", 
            description: "Improve existing UI design", 
            prefix: "/improve" 
        },
        { 
            icon: <PlusIcon className="w-4 h-4" />, 
            label: "Project", 
            description: "Create a new CRM project", 
            prefix: "/project" 
        },
        { 
            icon: <SendIcon className="w-4 h-4" />, 
            label: "Draft", 
            description: "Draft a personalized email", 
            prefix: "/draft" 
        },
    ];

    useEffect(() => {
        if (value.startsWith('/') && !value.includes(' ')) {
            setShowCommandPalette(true);
            const matchingSuggestionIndex = commandSuggestions.findIndex((cmd) => cmd.prefix.startsWith(value));
            setActiveSuggestion(matchingSuggestionIndex >= 0 ? matchingSuggestionIndex : -1);
        } else {
            setShowCommandPalette(false);
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (commandPaletteRef.current && !commandPaletteRef.current.contains(target)) {
                setShowCommandPalette(false);
            }
            if (modelDropdownRef.current && !modelDropdownRef.current.contains(target)) {
                setIsModelDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showCommandPalette) {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActiveSuggestion(prev => prev < commandSuggestions.length - 1 ? prev + 1 : 0); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveSuggestion(prev => prev > 0 ? prev - 1 : commandSuggestions.length - 1); }
            else if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                if (activeSuggestion >= 0) selectCommandSuggestion(activeSuggestion);
            } else if (e.key === 'Escape') { e.preventDefault(); setShowCommandPalette(false); }
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) handleSendMessage();
        }
    };

    const handleSendMessage = async () => {
        if (value.trim() && !isThinking && !isTyping && activeSessionId) {
            const userContent = value.trim();
            setValue("");
            adjustHeight(true);
            
            addMessage(activeSessionId, { role: "user", content: userContent });
            setIsThinking(true);
            
            try {
                const response = await apiClient.post<{suggested_action: string, response_prefix: string}>("/ai/secretary", { user_input: userContent });
                setIsThinking(false);
                setIsTyping(true);
                
                const aiResponse = response.response_prefix || "Analyse terminée.";
                let currentText = "";
                
                // Add empty AI message
                addMessage(activeSessionId, { role: "assistant", content: "" });
                
                // Simulate typing
                for (let i = 0; i < aiResponse.length; i++) {
                    currentText += aiResponse[i];
                    useChatStore.setState((state) => ({
                        sessions: state.sessions.map((s) => 
                            s.id === activeSessionId 
                                ? { ...s, messages: [...s.messages.slice(0, -1), { role: "assistant", content: currentText }] }
                                : s
                        ),
                    }));
                    await new Promise(r => setTimeout(r, 5 + Math.random() * 5));
                }
                
                if (response.suggested_action) {
                    setTimeout(() => { window.location.href = response.suggested_action; }, 2000);
                }
            } catch (error) {
                console.error("NanoClaw Error:", error);
                setIsThinking(false);
                addMessage(activeSessionId, { role: "assistant", content: "Désolé, une erreur est survenue." });
            } finally {
                setIsTyping(false);
            }
        }
    };

    const selectCommandSuggestion = (index: number) => {
        const selectedCommand = commandSuggestions[index];
        setValue(selectedCommand.prefix + ' ');
        setShowCommandPalette(false);
    };

    return (
        <div ref={containerRef} className="flex flex-col w-full h-full items-center bg-transparent text-[--color-text] p-6 relative perspective-container">
            <div className="w-full max-w-2xl mx-auto flex flex-col h-full relative">
                <AnimatePresence mode="wait">
                    {messages.length === 0 && !isThinking && (
                        <motion.div 
                            key="greeting"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-center py-16 flex-shrink-0"
                        >
                            <div className="flex items-center justify-center gap-3 mb-3">
                                <span className="text-[--color-cta] text-3xl animate-float">✺</span>
                                <h1 className="text-5xl font-normal tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
                                    Bon après-midi
                                </h1>
                            </div>
                            <p className="text-sm uppercase tracking-[0.2em] font-medium opacity-60">
                                Comment puis-je accélérer votre prospection ?
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div 
                    ref={messagesRef}
                    className="flex-1 overflow-y-auto custom-scrollbar px-1 py-6 space-y-8"
                >
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={cn("flex flex-col gap-2", msg.role === "user" ? "items-end" : "items-start")}
                        >
                            <div className={cn(
                                "max-w-[85%] px-6 py-4 rounded-2xl text-body leading-relaxed whitespace-pre-wrap transition-all",
                                msg.role === "user" 
                                    ? "bg-[--color-surface] text-[--color-text] shadow-ring-warm" 
                                    : "bg-transparent text-[--color-text] border-l-2 border-[--color-border-warm] ml-2 pl-8 opacity-90"
                            )}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isThinking && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 items-center text-sm text-[--color-text-tertiary] font-serif pl-10">
                            <Spinner size={16} /> 
                            <span className="italic">Réflexion en cours...</span>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="mt-auto pt-6 flex-shrink-0 w-full">
                    <motion.div 
                        className="relative glass-premium rounded-2xl shadow-whisper weightless-lift border border-[--color-border-subtle]"
                        layoutId="composer"
                    >
                        <AnimatePresence>
                            {showCommandPalette && (
                                <motion.div 
                                    ref={commandPaletteRef}
                                    className="absolute left-2 right-2 bottom-full mb-3 glass-premium rounded-xl z-50 shadow-xl border border-[--color-border-subtle] overflow-hidden"
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                >
                                    <div className="py-1.5 p-1">
                                        {commandSuggestions.map((suggestion, index) => (
                                            <div
                                                key={suggestion.prefix}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all cursor-pointer",
                                                    activeSuggestion === index ? "bg-[--color-cta] text-white" : "text-[--color-text-secondary] hover:bg-[--color-surface-2]"
                                                )}
                                                onClick={() => selectCommandSuggestion(index)}
                                            >
                                                <div className={cn("w-5 h-5 flex items-center justify-center", activeSuggestion === index ? "text-white" : "text-[--color-text-tertiary]")}>{suggestion.icon}</div>
                                                <div className="font-medium">{suggestion.label}</div>
                                                <div className={cn("text-[10px] ml-auto opacity-60", activeSuggestion === index ? "text-white" : "")}>{suggestion.prefix}</div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-4 flex flex-col gap-4">
                            <div className="flex items-start gap-3">
                                <button type="button" className="flex-shrink-0 mt-2 p-1.5 text-[--color-text-tertiary] hover:text-[--color-cta] hover:bg-[--color-cta]/10 rounded-full transition-all">
                                    <PlusIcon className="w-5 h-5" />
                                </button>
                                <Textarea
                                    ref={textareaRef}
                                    value={value}
                                    onChange={(e) => { setValue(e.target.value); adjustHeight(); }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Interrogez ProspectOS..."
                                    containerClassName="flex-1"
                                    className="w-full px-0 py-2 resize-none bg-transparent border-none text-[--color-text] text-lg focus:outline-none placeholder:text-[--color-text-tertiary] min-h-[44px]"
                                    style={{ overflow: "hidden" }}
                                    showRing={false}
                                />
                                
                                <div className="flex items-center gap-3 mt-1.5">
                                    <AnimatePresence mode="wait">
                                        {!isVoiceActive ? (
                                            <motion.button 
                                                key="mic"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                onClick={() => setIsVoiceActive(true)}
                                                className="p-2 text-[--color-text-tertiary] hover:text-[--color-cta] transition-colors"
                                            >
                                                <Mic className="w-5 h-5" />
                                            </motion.button>
                                        ) : (
                                            <motion.button 
                                                key="stop"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                onClick={() => setIsVoiceActive(false)}
                                                className="flex items-center gap-3 p-1.5 bg-[--color-cta]/10 text-[--color-cta] rounded-full px-4"
                                            >
                                                <ChatWaveform isActive={true} />
                                                <Square className="w-3 h-3 fill-current" />
                                            </motion.button>
                                        )}
                                    </AnimatePresence>

                                    <motion.button
                                        type="button"
                                        onClick={handleSendMessage}
                                        disabled={isThinking || isTyping || !value.trim()}
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                            value.trim() && !isThinking ? "bg-[--color-cta] text-white shadow-lg" : "bg-[--color-surface-2]/50 text-[--color-text-tertiary] opacity-50"
                                        )}
                                    >
                                        {isThinking || isTyping ? <Spinner size={18} /> : <ArrowUpIcon className="w-5 h-5" strokeWidth={2.5} />}
                                    </motion.button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-[--color-border-subtle]/50 pt-3 px-1">
                                <div className="flex items-center gap-2">
                                    <div className="relative" ref={modelDropdownRef}>
                                        <button 
                                            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[--color-surface-2]/30 border border-[--color-border-subtle] text-[11px] font-medium text-[--color-text-secondary] hover:bg-[--color-surface-2]/60 transition-colors"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-[--color-cta]" />
                                            {activeSession?.model || "Sonnet 4.6"}
                                            <ChevronDown className={cn("w-3 h-3 transition-transform opacity-60", isModelDropdownOpen && "rotate-180")} />
                                        </button>
                                        <AnimatePresence>
                                            {isModelDropdownOpen && (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    className="absolute bottom-full left-0 mb-3 w-44 glass-premium border border-[--color-border-subtle] rounded-xl shadow-2xl z-[60] overflow-hidden p-1"
                                                >
                                                    {models.map(m => (
                                                        <button 
                                                            key={m}
                                                            onClick={() => { 
                                                                useChatStore.setState(state => ({
                                                                    sessions: state.sessions.map(s => s.id === activeSessionId ? { ...s, model: m } : s)
                                                                }));
                                                                setIsModelDropdownOpen(false); 
                                                            }}
                                                            className={cn(
                                                                "w-full text-left px-4 py-2 rounded-lg text-xs transition-colors",
                                                                (activeSession?.model || "Sonnet 4.6") === m ? "bg-[--color-cta] text-white" : "hover:bg-[--color-surface-2] text-[--color-text-secondary]"
                                                            )}
                                                        >
                                                            {m}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                                <div className="flex gap-2.5">
                                    <CommandChip icon={<Clip className="w-3.5 h-3.5" />} label="Code" />
                                    <CommandChip icon={<Zap className="w-3.5 h-3.5" />} label="Stratégiser" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="mt-8 flex flex-col items-center gap-5">
                        {messages.length > 0 && (
                            <button 
                                onClick={() => activeSessionId && clearHistory(activeSessionId)} 
                                className="text-[10px] font-bold uppercase tracking-[0.2em] text-[--color-text-tertiary] hover:text-error/70 transition-colors"
                            >
                                Effacer la discussion
                            </button>
                        )}
                        
                        {messages.length === 0 && (
                            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                                {commandSuggestions.slice(0, 3).map((suggestion, index) => (
                                    <button 
                                        key={suggestion.prefix} 
                                        onClick={() => selectCommandSuggestion(index)} 
                                        className="flex items-center gap-3 px-5 py-3 glass-premium hover:bg-[--color-surface-2] border border-[--color-border-subtle] rounded-full text-[13px] font-medium text-[--color-text-secondary] transition-all shadow-sm hover:shadow-md hover:-translate-y-1"
                                    >
                                        <span className="text-[--color-text-tertiary] opacity-70">{suggestion.icon}</span>
                                        <span>{suggestion.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {(isThinking || isTyping || isVoiceActive) && (
                    <motion.div 
                        className="fixed bottom-12 left-1/2 -ml-[120px] glass-premium rounded-full px-6 py-3 shadow-2xl border border-[--color-border-subtle] z-50 flex items-center gap-4 min-w-[240px]"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                    >
                        <div className="w-7 h-7 rounded-lg bg-[--color-cta] flex items-center justify-center shadow-lg animate-pulse">
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="font-bold tracking-tight">ProspectOS</span>
                            <span className="text-[--color-text-secondary] whitespace-nowrap">{isThinking ? "Réflexion..." : isVoiceActive ? "Assistant Vocal..." : "Saisie..."}</span>
                            <TypingDots />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function TypingDots() {
    return (
        <div className="flex items-center ml-1 space-x-1">
            {[1, 2, 3].map((dot) => (
                <motion.div
                    key={dot}
                    className="w-1 h-1 bg-[--color-cta] rounded-full"
                    animate={{ 
                        opacity: [0.3, 1, 0.3],
                        scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: dot * 0.2,
                    }}
                />
            ))}
        </div>
    );
}
