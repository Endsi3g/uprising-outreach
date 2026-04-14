"use client";

import { useEffect, useRef, useCallback, useTransition, useState } from "react";
import { cn } from "@/lib/utils";
import {
    LayoutGrid,
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react"
import { apiClient } from "@/lib/api";

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
            "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-muted-foreground",
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
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-violet-500/30"
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

export function AnimatedAIChat() {
    const [value, setValue] = useState("");
    const [attachments, setAttachments] = useState<string[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
    const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [recentCommand, setRecentCommand] = useState<string | null>(null);
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });
    const [inputFocused, setInputFocused] = useState(false);
    const [selectedModel, setSelectedModel] = useState("Sonnet 4.6");
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const commandPaletteRef = useRef<HTMLDivElement>(null);
    const modelDropdownRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const models = ["Sonnet 4.6", "Haiku 4.1", "Opus 4.5", "GPT-4o", "O1-preview"];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, isThinking]);

    useEffect(() => {
        const saved = localStorage.getItem("prospectos_chat_history");
        if (saved) {
            try {
                setMessages(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse chat history", e);
            }
        }
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem("prospectos_chat_history", JSON.stringify(messages));
        }
    }, [messages]);

    const commandSuggestions: CommandSuggestion[] = [
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
        { 
            icon: <Paperclip className="w-4 h-4" />, 
            label: "Capture", 
            description: "Capture lead from LinkedIn URL", 
            prefix: "/capture" 
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
            const commandButton = document.querySelector('[data-command-button]');
            if (commandPaletteRef.current && !commandPaletteRef.current.contains(target) && !commandButton?.contains(target)) {
                setShowCommandPalette(false);
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
        if (value.trim() && !isThinking && !isTyping) {
            const userContent = value.trim();
            setValue("");
            adjustHeight(true);
            setMessages(prev => [...prev, { role: "user", content: userContent }]);
            setIsThinking(true);
            try {
                const response = await apiClient.post<{suggested_action: string, response_prefix: string}>("/ai/secretary", { user_input: userContent });
                setIsThinking(false);
                setIsTyping(true);
                const aiResponse = response.response_prefix || "Analyse terminée. Comment puis-je vous aider ?";
                let currentText = "";
                setMessages(prev => [...prev, { role: "assistant", content: "" }]);
                for (let i = 0; i < aiResponse.length; i++) {
                    currentText += aiResponse[i];
                    setMessages(prev => {
                        const next = [...prev];
                        next[next.length - 1] = { role: "assistant", content: currentText };
                        return next;
                    });
                    await new Promise(r => setTimeout(r, 8 + Math.random() * 8));
                }
                if (response.suggested_action) {
                    setTimeout(() => { window.location.href = response.suggested_action; }, 2000);
                }
            } catch (error) {
                console.error("NanoClaw Error:", error);
                setIsThinking(false);
                setMessages(prev => [...prev, { role: "assistant", content: "Désolé, une erreur est survenue lors de la connexion au backend." }]);
            } finally {
                setIsTyping(false);
            }
        }
    };

    const handleAttachFile = () => {
        const mockFileName = `file-${Math.floor(Math.random() * 1000)}.pdf`;
        setAttachments(prev => [...prev, mockFileName]);
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };
    
    const selectCommandSuggestion = (index: number) => {
        const selectedCommand = commandSuggestions[index];
        setValue(selectedCommand.prefix + ' ');
        setShowCommandPalette(false);
        setRecentCommand(selectedCommand.label);
        setTimeout(() => setRecentCommand(null), 2000);
    };

    return (
        <div className="flex flex-col w-full h-full items-center bg-transparent text-[--color-text] p-6 relative overflow-visible">
            <div className="w-full max-w-2xl mx-auto flex flex-col h-full relative">
                <AnimatePresence mode="wait">
                    {messages.length === 0 && (
                        <motion.div 
                            key="greeting"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-center py-12 flex-shrink-0"
                        >
                            <div className="flex items-center justify-center gap-2.5 mb-2">
                                <span className="text-[--color-cta] text-2xl">✺</span>
                                <h1
                                    className="text-4xl font-normal leading-tight"
                                    style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}
                                >
                                    Bon après-midi, Kael
                                </h1>
                            </div>
                            <p className="text-sm uppercase tracking-[0.1em] font-medium" style={{ color: "var(--color-text-tertiary)" }}>
                                Comment puis-je accélérer votre prospection aujourd'hui ?
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-1 py-4 space-y-6">
                    <AnimatePresence initial={false}>
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={cn("flex flex-col gap-2", msg.role === "user" ? "items-end" : "items-start")}
                            >
                                <div className={cn(
                                    "max-w-[85%] px-5 py-3.5 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap transition-all",
                                    msg.role === "user" 
                                        ? "bg-[--color-surface] text-[--color-text] shadow-[0_0_0_1px_var(--color-border-subtle)]" 
                                        : "bg-transparent text-[--color-text] border-l border-[--color-border-warm] pl-8"
                                )}>
                                    {msg.content}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isThinking && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-center text-xs text-[--color-text-tertiary] font-serif pl-6">
                            <Spinner size={14} /> 
                            <span>Réflexion en cours...</span>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="mt-auto pt-4 flex-shrink-0">
                    <motion.div className="relative backdrop-blur-2xl bg-[--color-surface] rounded-2xl border border-[--color-border] shadow-whisper" initial={{ scale: 0.98 }} animate={{ scale: 1 }}>
                        <AnimatePresence>
                            {showCommandPalette && (
                                <motion.div 
                                    ref={commandPaletteRef}
                                    className="absolute left-4 right-4 bottom-full mb-2 backdrop-blur-xl bg-[--color-surface] rounded-lg z-50 shadow-lg border border-[--color-border] overflow-hidden"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                >
                                    <div className="py-1">
                                        {commandSuggestions.map((suggestion, index) => (
                                            <div
                                                key={suggestion.prefix}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer",
                                                    activeSuggestion === index ? "bg-[--color-surface-2] text-[--color-text]" : "text-[--color-text-secondary] hover:bg-[--color-surface-2]"
                                                )}
                                                onClick={() => selectCommandSuggestion(index)}
                                            >
                                                <div className="w-5 h-5 flex items-center justify-center text-[--color-text-tertiary]">{suggestion.icon}</div>
                                                <div className="font-medium">{suggestion.label}</div>
                                                <div className="text-[--color-text-tertiary] text-[10px] ml-1">{suggestion.prefix}</div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-4">
                            <Textarea
                                ref={textareaRef}
                                value={value}
                                onChange={(e) => { setValue(e.target.value); adjustHeight(); }}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
                                placeholder="Posez une question à ProspectOS..."
                                containerClassName="w-full"
                                className="w-full px-4 py-3 resize-none bg-transparent border-none text-[--color-text] text-sm focus:outline-none placeholder:text-[--color-text-tertiary] min-h-[60px]"
                                style={{ overflow: "hidden" }}
                                showRing={false}
                            />
                        </div>

                        <AnimatePresence>
                            {attachments.length > 0 && (
                                <motion.div className="px-4 pb-3 flex gap-2 flex-wrap" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                                    {attachments.map((file, index) => (
                                        <div key={index} className="flex items-center gap-2 text-xs bg-[--color-surface-2] py-1.5 px-3 rounded-lg text-[--color-text-secondary]">
                                            <span>{file}</span>
                                            <button onClick={() => removeAttachment(index)} className="text-[--color-text-tertiary] hover:text-[--color-text]">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                            </button>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-4 border-t border-[--color-border] flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={handleAttachFile} className="p-2 text-[--color-text-tertiary] hover:text-[--color-text] rounded-lg transition-colors group">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                                </button>
                                <button type="button" data-command-button onClick={(e) => { e.stopPropagation(); setShowCommandPalette(prev => !prev); }} className={cn("p-2 text-[--color-text-tertiary] hover:text-[--color-text] rounded-lg transition-colors group", showCommandPalette && "bg-[--color-surface-2] text-[--color-text]")}>
                                    <Command className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <motion.button
                                type="button"
                                onClick={handleSendMessage}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isThinking || isTyping || !value.trim()}
                                className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2", value.trim() && !isThinking ? "bg-[--color-cta] text-white shadow-lg" : "bg-[--color-surface-2] text-[--color-text-tertiary] opacity-50")}
                            >
                                {isThinking || isTyping ? <Spinner size={16} /> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>}
                                <span>Envoyer</span>
                            </motion.button>
                        </div>
                    </motion.div>

                    <div className="mt-4 flex flex-col items-center gap-4">
                        {messages.length > 0 && (
                            <button onClick={() => { setMessages([]); localStorage.removeItem("prospectos_chat_history"); }} className="text-[10px] font-bold uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-colors">
                                Recommencer la discussion
                            </button>
                        )}
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {commandSuggestions.map((suggestion, index) => (
                                <button key={suggestion.prefix} onClick={() => selectCommandSuggestion(index)} className="flex items-center gap-2 px-3 py-2 bg-[--color-surface] hover:bg-[--color-surface-2] border border-[--color-border] rounded-lg text-sm text-[--color-text-secondary] transition-all">
                                    {suggestion.icon}
                                    <span>{suggestion.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {(isThinking || isTyping) && (
                    <motion.div 
                        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 backdrop-blur-2xl bg-[--color-surface] rounded-full px-4 py-2 shadow-lg border border-[--color-border] z-50 flex items-center gap-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <div className="w-8 h-7 rounded-sm bg-[--color-cta] flex items-center justify-center">
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[--color-text-secondary]">
                            <span className="font-medium text-[--color-text]">ProspectOS</span>
                            <span className="text-[--color-text-tertiary]">{isThinking ? "Réflexion..." : "Transcription..."}</span>
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
        <div className="flex items-center ml-1">
            {[1, 2, 3].map((dot) => (
                <motion.div
                    key={dot}
                    className="w-1.5 h-1.5 bg-[--color-cta] rounded-full mx-0.5"
                    initial={{ opacity: 0.3 }}
                    animate={{ 
                        opacity: [0.3, 0.9, 0.3],
                        scale: [0.85, 1.1, 0.85]
                    }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: dot * 0.15,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}
