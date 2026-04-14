"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Project } from "@/types/projects";
import { ProjectSidebar } from "@/components/projects/ProjectSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MoreHorizontal, Star, Send, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ProjectDetailsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-[--color-text-tertiary] animate-pulse font-serif">Chargement...</div>}>
      <ProjectDetailsContent />
    </Suspense>
  );
}

function ProjectDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["projects", id],
    queryFn: () => apiClient.get<Project>(`/projects/${id}`),
    enabled: !!id
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: () => apiClient.patch(`/projects/${id}`, { is_favorite: !project?.is_favorite }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects", id] }),
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isTyping) return;

    const userPrompt = prompt;
    setMessages(prev => [...prev, { role: "user", content: userPrompt }]);
    setPrompt("");
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 1000));
    
    const response = "J'ai bien pris en compte les instructions et les fichiers de votre projet. Comment puis-je vous aider spécifiquement aujourd'hui ?";
    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    setIsTyping(false);
  };

  if (isLoading || !project) {
    return (
      <div className="flex items-center justify-center h-full text-[--color-text-tertiary] animate-pulse font-serif">
        Chargement du projet...
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[--color-bg] overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 px-6 border-b border-[--color-border] flex items-center justify-between bg-[--color-bg] z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/projects")}
              className="p-2 hover:bg-[--color-surface-2] rounded-lg transition-colors text-[--color-text-tertiary] hover:text-[--color-text]"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="h-4 w-px bg-[--color-border]" />
            <div>
              <h2 className="text-sm font-medium text-[--color-text] font-serif truncate max-w-[300px]">
                {project.name}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => toggleFavoriteMutation.mutate()}
              className={cn(
                "p-2 hover:bg-[--color-surface-2] rounded-lg transition-colors",
                project.is_favorite ? "text-[--color-cta]" : "text-[--color-text-tertiary] hover:text-[--color-text]"
              )}
            >
              <Star size={18} fill={project.is_favorite ? "currentColor" : "none"} />
            </button>
            <button className="p-2 hover:bg-[--color-surface-2] rounded-lg transition-colors text-[--color-text-tertiary] hover:text-[--color-text]">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className={cn(
            "flex-1 overflow-y-auto px-6 py-10 flex flex-col items-center custom-scrollbar relative",
            messages.length > 0 ? "justify-start" : "justify-center"
          )}
        >
          <div className="w-full max-w-[700px]">
            <AnimatePresence mode="popLayout">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center mb-8 text-center"
                >
                  <div className="w-16 h-16 bg-[--color-surface] rounded-2xl flex items-center justify-center mb-6 border border-[--color-border] shadow-sm">
                    <span className="text-2xl text-[--color-cta]">✺</span>
                  </div>
                  <h1 className="text-2xl font-serif font-medium text-[--color-text] mb-3">
                    {project.name}
                  </h1>
                  <p className="text-sm text-[--color-text-secondary] max-w-sm leading-relaxed px-4 italic font-serif opacity-80">
                    {project.description || "Prêt à travailler sur ce projet ? Posez-moi vos questions ou ajoutez des documents pour commencer."}
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-8 pb-10">
                  {messages.map((msg, i) => (
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
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <div className="flex items-center gap-1.5 ml-2 text-[--color-text-tertiary] animate-pulse">
                      <span className="w-1.5 h-1.5 bg-[--color-cta] rounded-full" />
                      <span className="text-xs">L'assistant réfléchit...</span>
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="w-full max-w-[760px] mx-auto pb-10 px-6 flex-shrink-0">
          <div className="relative rounded-2xl border border-[--color-border] bg-[--color-bg] shadow-whisper overflow-hidden transition-all focus-within:border-[--color-border-warm]">
            <textarea
              className="w-full bg-transparent resize-none outline-none px-6 pt-5 pb-16 text-md font-sans"
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

            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
              <button className="w-8 h-8 rounded-full flex items-center justify-center text-[--color-text-tertiary] hover:bg-[--color-surface-2] hover:text-[--color-text] transition-all">
                <Paperclip size={18} />
              </button>

              <div className="flex items-center gap-4 text-xs font-medium text-[--color-text-tertiary]">
                <span className="cursor-pointer hover:text-[--color-text] transition-colors uppercase tracking-widest text-[10px]">Sonnet 4.6 ⌄</span>
                <button 
                  onClick={() => handleSubmit()}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                    prompt.trim() ? "bg-[--color-cta] text-white" : "bg-[--color-surface-2] text-[--color-text-tertiary]"
                  )}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProjectSidebar project={project} />
    </div>
  );
}
