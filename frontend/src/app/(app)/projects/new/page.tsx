"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Project } from "@/types/projects";
import { Button, Input, Textarea } from "@/components/ui";
import { motion } from "framer-motion";

export default function NewProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) => 
      apiClient.post<Project>("/projects", data),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.push(`/projects/details?id=${project.id}`);
    }
  });

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (name.trim()) {
      createMutation.mutate({ name, description });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-[--color-bg] px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[600px] flex flex-col items-center text-center"
      >
        <h1 
          className="text-[2.2rem] font-medium mb-10"
          style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}
        >
          Créer un projet personnel
        </h1>

        <form onSubmit={handleSubmit} className="w-full space-y-8 text-left">
          <div className="space-y-3">
            <label className="text-sm font-medium text-[--color-text-secondary] ml-1">
              Sur quoi travaillez-vous ?
            </label>
            <div 
              className="rounded-2xl border border-[--color-border] bg-[--color-bg] shadow-whisper focus-within:ring-2 focus-within:ring-[--color-focus]/20 transition-all overflow-hidden"
              style={{ padding: "2px" }}
            >
              <input
                className="w-full bg-transparent outline-none px-6 py-4 text-base"
                style={{ color: "var(--color-text)" }}
                placeholder="Nommez votre projet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-[--color-text-secondary] ml-1">
              Qu'essayez-vous de faire ?
            </label>
            <div className="rounded-2xl border border-[--color-border] bg-[--color-surface] shadow-whisper overflow-hidden">
              <textarea
                className="w-full bg-transparent resize-none outline-none px-6 py-5 text-base font-serif italic"
                style={{ color: "var(--color-text)", minHeight: "140px" }}
                placeholder="Décrivez votre projet, vos objectifs, le sujet, etc...."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/projects")}
              className="px-8 py-2.5 rounded-xl bg-[--color-surface-2] hover:bg-[--color-surface-white] transition-all border-none font-medium"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createMutation.isPending || !name.trim()}
              className="px-8 py-2.5 rounded-xl shadow-md font-medium"
            >
              {createMutation.isPending ? "Création..." : "Créer un projet"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
